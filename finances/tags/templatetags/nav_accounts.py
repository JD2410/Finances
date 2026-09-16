from django import template
from accSavings.models import Accounts, Transactions
from django.db.models import Sum
from accSavings.views import get_account_totals


register = template.Library()

@register.inclusion_tag('_partials/accounts.html')
def render_accounts():
    return get_account_totals()