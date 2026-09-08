from django.shortcuts import render
from accSavings.models import Transactions, Accounts
from accInvestments.models import InvestmentRecords, Investments
from django.db.models import Sum
import datetime
from decimal import Decimal

# Create your views here.
def index(request):

    if request.method == 'GET':

        start_date = (datetime.date.today() - datetime.timedelta(3*365/12)).isoformat()
        
        savings = Accounts.objects.all()
        accounts = []
        total = 0

        for account in savings:

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
                if len(get_transactions_total):
                    transaction_total = get_transactions_total['amount']

                get_transactions_start_total = Transactions.objects.values('amount').filter(
                    date__lte=start_date,
                    accountId=account.id
                ).order_by('-date').first()

                if get_transactions_start_total != None:
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
                'name': account.name,
                'total': transaction_total,
                'type_details': {
                    'name': account.accountType.name,
                    'accumulate': account.accountType.accumulate,
                },
                'graph_start': transactions_start_total,
                'daily_totals': daily_totals
            })

        get_recent_transactions = Transactions.objects.all().filter().order_by('-date')[:10]

        return render(
            request, 'dashboard.html',
            {
                'savings': accounts,
                'recent_transactions': get_recent_transactions,
                'total': total
            }
        )