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
        
        savings = Accounts.objects.all().values()
        accounts = []
        total = 0

        for account in savings:

            get_transactions_total = Transactions.objects.values('accountId').annotate(total=Sum('amount')).filter(accountId = account['id'])

            transaction_total = 0.00

            get_transactions_start_total = Transactions.objects.values('accountId').annotate(total=Sum('amount')).filter(
                date__lte=start_date,
                accountId=account['id']
            )
            transactions_start_total = None

            get_daily_totals = Transactions.objects.values('date').annotate(total=Sum('amount')).order_by('date').filter(
                date__gte=start_date,
                date__lte=datetime.date.today(),
                accountId=account['id']
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
                'name': account['name'],
                'total': transaction_total,
                'type': 'saving'
            })

            accounts.append({
                'name': account['name'],
                'type': 'saving',
                'graph_start': transactions_start_total,
                'daily_totals': daily_totals
            })

        investments = Investments.objects.all().values()
        for investment in investments:
            record = InvestmentRecords.objects.filter(investment = investment['id']).values().order_by('-date').first()
            if record != None:
                account_totals.append({
                    'name': investment['name'],
                    'total': record['value'],
                    'type': 'investment'
                })
            else:
                account_totals.append({
                    'name': investment['name'],
                    'total': 0,
                    'type': 'investment'
                })

            get_value_start_total = InvestmentRecords.objects.values('value').filter(
                date__lte=start_date,
                investment=investment['id']
            ).order_by('-date').first()

            value_start_total = None
            if get_value_start_total != None:
                value_start_total = get_value_start_total['value']


            get_daily_values = InvestmentRecords.objects.values().order_by('date').filter(
                date__gte=start_date,
                date__lte=datetime.date.today(),
                investment=investment['id']
            )

            daily_values = {}
            if len(get_daily_values):
                for day in get_daily_values:
                    daily_values[day['date'].strftime("%Y-%m-%d")] = day['value']

            accounts.append({
                'name': investment['name'],
                'type': 'investment',
                'graph_start': value_start_total,
                'daily_totals': daily_values
            })

        recent_savings = []
        recent_investments = []

        get_date_savings = Transactions.objects.all().filter().order_by('accountId', '-date')[:10]
        get_date_investments = InvestmentRecords.objects.all().order_by('investment', '-date')[:10]

        for saving_date in get_date_savings:

            name_transaction = "-"
            if saving_date.name != None:
                name_transaction = saving_date.name

            recent_savings.append({
                'name': name_transaction,
                'amount': saving_date.amount,
                'account_name': saving_date.accountId.name,
                'date': saving_date.date
            })

        for saving_date in get_date_investments:
            name_transaction = "-"
            if saving_date.description != None:
                name_transaction = saving_date.description

            recent_investments.append({
                'name': name_transaction,
                'amount': saving_date.value,
                'account_name': saving_date.investment.name,
                'date': saving_date.date
            })

        return render(
            request, 'dashboard.html',
            {
                'account_total': account_totals,
                'savings': accounts,
                'recent_investments': recent_investments,
                'recent_transactions': recent_savings,
                'total': total
            }
        )