from django.shortcuts import render
from accSavings.models import Transactions, Accounts
from accInvestments.models import InvestmentRecords, Investments
from django.db.models import Sum
import datetime
from decimal import Decimal

# Create your views here.
def index(request):

    if request.method == 'GET':

        account_totals = []
        start_date = (datetime.date.today() - datetime.timedelta(3*365/12)).isoformat()
        
        savings = Accounts.objects.all()
        accounts = []
        total = 0

        for account in savings:

            get_transactions_total = Transactions.objects.values('accountId').annotate(total=Sum('amount')).filter(accountId = account.id)

            transaction_total = 0.00

            get_transactions_start_total = Transactions.objects.values('accountId').annotate(total=Sum('amount')).filter(
                date__lte=start_date,
                accountId=account.id
            )
            transactions_start_total = None

            get_daily_totals = Transactions.objects.values('date').annotate(total=Sum('amount')).order_by('date').filter(
                date__gte=start_date,
                date__lte=datetime.date.today(),
                accountId=account.id
            )
            daily_totals = {}

            if len(get_transactions_total):
                transaction_total = get_transactions_total[0]['total']             

            if len(get_transactions_start_total):
                transactions_start_total = get_transactions_start_total[0]['total']

            if len(get_daily_totals):
                for day in get_daily_totals:
                    daily_totals[day['date'].strftime("%Y-%m-%d")] = day['total']

            total += Decimal(transaction_total)

            account_totals.append({
                'name': account.name,
                'total': transaction_total,
                'type': 'saving'
            })

            accounts.append({
                'name': account.name,
                'type': 'saving',
                'graph_start': transactions_start_total,
                'daily_totals': daily_totals
            })

        investments = Investments.objects.all().values()
        get_recent_transactions = Transactions.objects.all().filter().order_by('-date')[:10]

        return render(
            request, 'dashboard.html',
            {
                'account_total': account_totals,
                'savings': accounts,
                'recent_transactions': get_recent_transactions,
                'total': total
            }
        )