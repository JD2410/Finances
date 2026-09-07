# THIS IS ACCSAVINGS
import csv
import io
import json

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.db.models import Sum
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.db import transaction

from .models import Transactions, Accounts
from .forms import TransactionForm, SavingsAccountForm, CsvUploader, SavingsRecordFormSet


# Create your views here.
def index(request):
    accountForm = SavingsAccountForm()
    csvForm = CsvUploader()
    csvContents = False
    form = TransactionForm()

    if request.method == 'POST':
        if 'addTransaction' in request.POST:
            form = TransactionForm(request.POST)
            if form.is_valid():
                form.save()
        elif 'addAccount' in request.POST:
            accountForm = SavingsAccountForm(request.POST)
            if accountForm.is_valid():
                accountForm.save()
        elif 'deleteAccount' in request.POST:
            try:
                getDeleteRecord = Accounts.objects.get(id=request.POST['accountId'])
                getDeleteRecord.delete()
                messages.success(request, "Account deleted successfully.")
            except Accounts.DoesNotExist:
                messages.warning(request, "Account was not found or was already deleted.")
        elif 'deleteTransaction' in request.POST:
            print('transaction')
            try:
                getDeleteRecord = Transactions.objects.get(id=request.POST['deleteTransaction'])
                getDeleteRecord.delete()
                messages.success(request, "Transaction deleted successfully.")
            except Transactions.DoesNotExist:
                messages.warning(request, "Transaction was not found or was already deleted.")
        elif 'updateTransaction' in request.POST:
            try:
                getUpdateForm = Transactions.objects.get(id=request.POST['id'])
                getAccount = Accounts.objects.get(id=request.POST['accountId'])
                getUpdateForm.name = request.POST['name']
                getUpdateForm.amount = request.POST['amount']
                getUpdateForm.date = request.POST['date']
                getUpdateForm.accountId = getAccount
                getUpdateForm.save()
                messages.success(request, "Transaction updated successfully.")
            except Transactions.DoesNotExist:
                messages.warning(request, "Transaction was not found")
            except Accounts.DoesNotExist:
                messages.warning(request, "Account was not found")
        else:
            csvForm = CsvUploader(request.POST, request.FILES)
            csvContents = []
            if csvForm.is_valid():
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
                    csvContents.append(row_construct)


            return render(
                request, 'uploader.html', {  
                    'form': csvForm,
                    'results': csvContents
                }
            )

    accountAlt = Accounts.objects.all()
    transactions = Transactions.objects.all().order_by('-date')
    accounts = []
    daily_total = Transactions.objects.values('date').annotate(total=Sum('amount')).order_by('date')

    for account in accountAlt:
        getEarliset = Transactions.objects.all().filter(accountId=account.id).order_by('date').first()
        first = 0
        date = None

        if getEarliset != None:
            first = getEarliset.amount
            date = getEarliset.date

        accounts.append({
            'id': account.id,
            'name': account.name,
            'first': first,
            'firstDate': date
        })

    return render(
        request, 'savings.html',
        {
            'transactions': transactions,
            'accounts': accounts,
            'form': form,
            'daily': daily_total,
            'savings': accountForm,
            'csv': csvForm
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
