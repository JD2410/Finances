import datetime
import json

from django.shortcuts import render
from django.contrib import messages
from accounts.models import Transactions, Accounts
from django.db.models import Sum
from decimal import Decimal

from django.views.decorators.http import require_POST
from django.http import JsonResponse

def index(request):
    get_transactions = get_progress_chart()
    get_transactions['recent_transactions'] = Transactions.objects.all().filter().order_by('-date')[:10]
    return render(request, 'dashboard.html', get_transactions)

def get_progress_chart(date=None):
    if date:
        received_date = datetime.date.fromisoformat(date)
    else:
        received_date = datetime.date.today()
        
    start_date = (received_date - datetime.timedelta(3*365/12)).isoformat()
    total = 0
    accounts = []
    account_list = Accounts.objects.all()

    if account_list != None:
        for account in account_list:
            if account.accountType != None:
                transaction_total = 0.00
                transactions_start_total = None
                daily_totals = {}

                if account.accountType.accumulate:
                    get_transactions_total = Transactions.objects.values('accountId').annotate(total=Sum('amount')).filter(accountId = account.id)
                    if len(get_transactions_total):
                        transaction_total = get_transactions_total[0]['total'] 

                    get_transactions_start_total = Transactions.objects.values('accountId').annotate(total=Sum('amount')).filter(
                        date__lte=start_date,
                        accountId=account.id
                    )
                    if get_transactions_start_total != None:
                        if len(get_transactions_start_total):
                            transactions_start_total = get_transactions_start_total[0]['total']

                    get_daily_totals = Transactions.objects.values('date').annotate(total=Sum('amount')).order_by('date').filter(
                        date__gte=start_date,
                        date__lte=datetime.date.today(),
                        accountId=account.id
                    )
                    if len(get_daily_totals):
                        for day in get_daily_totals:
                            daily_totals[day['date'].strftime("%Y-%m-%d")] = day['total']
                else:
                    get_transactions_total = Transactions.objects.values('amount').filter(accountId = account.id).order_by('-date').first()
                    if get_transactions_total != None:
                        if len(get_transactions_total):
                            transaction_total = get_transactions_total['amount']

                    get_transactions_start_total = Transactions.objects.values('amount').filter(
                        date__lte=start_date,
                        accountId=account.id
                    ).order_by('-date').first()

                    if get_transactions_start_total != None:
                        if len(get_transactions_start_total):
                            transactions_start_total = get_transactions_start_total['amount']

                    get_daily_totals = Transactions.objects.values('amount', 'date').order_by('date').filter(
                        date__gte=start_date,
                        date__lte=datetime.date.today(),
                        accountId=account.id
                    )
                    if len(get_daily_totals):
                        for day in get_daily_totals:
                            daily_totals[day['date'].strftime("%Y-%m-%d")] = day['amount']
                        
                total += Decimal(transaction_total)

                accounts.append({
                    'id': account.id,
                    'name': account.name,
                    'total': transaction_total,
                    'type_details': {
                        'name': account.accountType.name,
                        'accumulate': account.accountType.accumulate,
                    },
                    'graph_start': transactions_start_total,
                    'daily_totals': daily_totals
                })

    return {
        'savings': accounts,
        'total': total
    }


@require_POST
def get_graph(request):
    try:
        data = json.loads(request.body)
        if data['date']:
            graph_details = get_progress_chart(data['date'])
        else:
            graph_details = get_progress_chart()

        graph_details['status'] = 'success'

        return JsonResponse(graph_details, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)


@require_POST
def get_transactions_date(request):
    try:
        data = json.loads(request.body)
        account_name = None
    
        if data['accountId']:
            get_transactions = Transactions.objects.all().filter(date__lte = data['date'], accountId=data['accountId']).order_by('-date')[:10]
            get_account_name = Accounts.objects.values('name').filter(id=data['accountId']).first()
            account_name = get_account_name['name']
        else:
            get_transactions = Transactions.objects.all().filter(date__lte = data['date']).order_by('-date')[:10]
        transaction = []

        for action in get_transactions:
            transaction.append({
                'id': action.id,
                'name': action.name,
                'amount': action.amount,
                'date': action.date,
                'account_details': {
                    'id': action.accountId.id,
                    'name': action.accountId.name,
                }
            })
        return JsonResponse({
            'status': 'success',
            'request_date': data['date'],
            'request_account': account_name,
            'transactions': transaction 
        }, status=200)
    
    except Transactions.DoesNotExist:
        return JsonResponse({"error": "Account cannot be found"}, status=400)
    except Accounts.DoesNotExist:
            return JsonResponse({"error": "Account cannot be found"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)