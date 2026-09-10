from django import template
from accSavings.models import Accounts, Transactions
from django.db.models import Sum


register = template.Library()

@register.inclusion_tag('_partials/accounts.html')
def render_accounts():
    accounts = Accounts.objects.all()
    accountDetails = []
    finalTotal = 0.00
    
    for account in accounts:

        total = 0.00
        if account.accountType.accumulate:
            get_transactions_total = Transactions.objects.values('accountId').annotate(total=Sum('amount')).filter(accountId = account.id)
            if len(get_transactions_total):
                total = get_transactions_total[0]['total']
        else:
            get_transactions_total = Transactions.objects.values('amount').filter(accountId = account.id).order_by('-date').first()
            if len(get_transactions_total):
                total = get_transactions_total['amount']
        
        accountDetails.append({
            'name': account.name,
            'total': total
        })
        finalTotal += float(total)
        

    return {
        'records': accountDetails,
        'total': finalTotal
        }