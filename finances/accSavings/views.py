import csv
import io
import json

from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Sum
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.db import transaction

from .models import Transactions, Accounts
from accountType.models import Type
from .forms import TransactionForm, SavingsAccountForm, CsvUploader, SavingsRecordFormSet

def index(request):
    accounts = Accounts.objects.all()
    account_form = SavingsAccountForm()
    csv_form = CsvUploader()
    csv_contents = False
    transaction_form = TransactionForm()


    if request.method == 'POST':
        if 'addTransaction' in request.POST:
            transaction_form = TransactionForm(request.POST)
            if transaction_form.is_valid():
                transaction_form.save()
                messages.success(request, "Transaction was successfully added")

        elif 'deleteTransaction' in request.POST:
            try:
                get_deleted_record = Transactions.objects.get(id=request.POST['deleteTransaction'])
                get_deleted_record.delete()
                messages.success(request, "Transaction deleted successfully.")
            except Transactions.DoesNotExist:
                messages.warning(request, "Transaction was not found or was already deleted.")
        elif 'updateTransaction' in request.POST:
            try:
                get_update_form = Transactions.objects.get(id=request.POST['id'])
                get_account = Accounts.objects.get(id=request.POST['accountId'])
                get_update_form.name = request.POST['name']
                get_update_form.amount = request.POST['amount']
                get_update_form.date = request.POST['date']
                get_update_form.accountId = get_account
                get_update_form.save()
                messages.success(request, "Transaction updated successfully.")
            except Transactions.DoesNotExist:
                messages.warning(request, "Transaction was not found")
            except Accounts.DoesNotExist:
                messages.warning(request, "Account was not found")
        elif 'addAccount' in request.POST:
            account_form = SavingsAccountForm(request.POST)
            if account_form.is_valid():
                account_form.save()
        elif 'deleteAccount' in request.POST:
            try:
                get_deleted_record = Accounts.objects.get(id=request.POST['accountId'])
                get_deleted_record.delete()
                messages.success(request, "Account deleted successfully.")
            except Accounts.DoesNotExist:
                messages.warning(request, "Account was not found or was already deleted.")
        elif 'updateAccount' in request.POST:
            try:
                get_account_type = Type.objects.get(id=request.POST['accountType'])
                get_account = Accounts.objects.get(id=request.POST['accountId'])
                get_account.name = request.POST['name']
                get_account.accountType = get_account_type
                get_account.save()
                messages.success(request, "Account updated")
            except Accounts.DoesNotExist:
                messages.warning(request, "Account was not found")
            except Type.DoesNotExist:
                messages.warning(request, "Account type was not found")
        else:
            csv_form = CsvUploader(request.POST, request.FILES)
            accounts_format = []
            for account in accounts:
                accounts_format.append({
                    'id': account.id,
                    'name': account.name,
                })

            csv_contents = []
            if csv_form.is_valid():
                csv_file = request.FILES['csv_file']
    
                file_data = csv_file.read().decode('utf-8')
                io_string = io.StringIO(file_data)
                reader = csv.DictReader(io_string)
    
                for row in reader:
                    row_construct = []
                    for key, val in row.items():
                        keyValue = {
                            'label': key,
                            'value': val
                        }
                        row_construct.append(keyValue)
                    csv_contents.append(row_construct)

            return render(
                request, 'uploader.html', {  
                    'form': csv_form,
                    'results': csv_contents,
                    'accounts': accounts_format
                }
            )

    transactions = Transactions.objects.all().order_by('-date')
    accounts_list = []
    daily_total = Transactions.objects.values('date').annotate(total=Sum('amount')).order_by('date')

    for account in accounts:
        get_earliest = Transactions.objects.all().filter(accountId=account.id).order_by('date').first()
        first = 0
        date = None

        if get_earliest != None:
            first = get_earliest.amount
            date = get_earliest.date

        accounts_list.append({
            'id': account.id,
            'name': account.name,
            'accountType': account.accountType,
            'first': first,
            'firstDate': date
        })

    return render(
        request, 'savings.html',
        {
            'transactions': transactions,
            'accounts': accounts_list,
            'form': transaction_form,
            'daily': daily_total,
            'savings': account_form,
            'csv': csv_form
        }
    )

@require_POST
def processRecords(request):
    try:
        data = json.loads(request.body)
        records = data.get("records", [])

        formset_data = {
            'form-TOTAL_FORMS': str(len(records)),
            'form-INITIAL_FORMS': '0',
            'form-MIN_NUM_FORMS': '0',
        }

        for index, record in enumerate(records):
            for form_name, val in record.items():
                formset_data[f'form-{index}-{form_name}'] = val

        formset = SavingsRecordFormSet(data=formset_data)

        if formset.is_valid():
            with transaction.atomic():
                for form in formset:
                    form.save()

            return JsonResponse({"status": "success"})

        errors_by_row = []
        for index, form in enumerate(formset):
            if form.errors:
                errors_by_row.append({
                    "row_index": index,
                    "errors": form.errors.get_json_data()
                })

        return JsonResponse({
            "status": "error",
            "message": "Validation failed on one or more rows.",
            "row_errors": errors_by_row
        }, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)
