from django import template
from accSavings.models import Accounts

register = template.Library()

@register.inclusion_tag('_partials/accounts.html')
def render_accounts():
    records = Accounts.objects.all()
    return {'records': records}