from django import forms
from django.forms import formset_factory
from .models import Transactions, Accounts

class SavingsAccountForm(forms.ModelForm):

    class Meta:
        model = Accounts
        fields = '__all__'

class CsvUploader(forms.Form):
    csv_file = forms.FileField(label="Select a CSV file")

class TransactionForm(forms.ModelForm):

    class Meta:
        model = Transactions
        fields = '__all__'

        widgets={
            'date':forms.TextInput(attrs={'type':'date'})
        }

SavingsRecordFormSet = formset_factory(TransactionForm, extra=0)