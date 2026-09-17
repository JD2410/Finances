import csv
import io
import json

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.db.models import Sum
from django.contrib import messages
from django.core.paginator import Paginator
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
                get_deleted_record = Accounts.objects.get(id=request.POST['deleteAccount'])
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

    get_page_number = request.GET.get('pn', 1)
    try:
        int(get_page_number)
        page = int(get_page_number)
    except ValueError:
        page = 1

    transactions = Transactions.objects.all().order_by('-date')
    paginated = Paginator(transactions, 20)
    paginated_transaction = paginated.get_page(page)

    accounts_list = []

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
            'created': account.created_at.strftime("%d %b %Y, %I:%M%p"),
            'accountType': {
                'id': account.accountType.id,
                'type_name': account.accountType.name,
                'type_accumulate': account.accountType.accumulate,
            },
            'first': first,
            'firstDate': date.strftime("%d %b %Y, %I:%M%p")
        })
    return render(
        request, 'savings.html',
        {
            'records': {
                'transactions': paginated_transaction,
                'number_of_pages': range(paginated.num_pages),
                'current_page': page
            },
            'accounts': accounts_list,
            'transaction_form': transaction_form,
            'savings_form': account_form,
            'csv_form': csv_form,
            'account_highlights': get_account_totals()
        }
    )

def get_account_totals():
    accounts = Accounts.objects.all()
    account_details = []
    final_total = 0.00
    
    for account in accounts:

        total = 0.00
        if account.accountType != None:
            if account.accountType.accumulate:
                get_transactions_total = Transactions.objects.values('accountId').annotate(total=Sum('amount')).filter(accountId = account.id)
                if len(get_transactions_total):
                    total = get_transactions_total[0]['total']
            else:
                get_transactions_total = Transactions.objects.values('amount').filter(accountId = account.id).order_by('-date').first()
                if get_transactions_total != None:
                    total = get_transactions_total['amount']
        
            account_details.append({
                'id': account.id,
                'name': account.name,
                'total': total
            })
            final_total += float(total)
    return {
        'records': account_details,
        'total': final_total
    }

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
