from django import forms
from .models import InvestmentRecords, Investments

class InvestentForm(forms.ModelForm):
    class Meta:
        model = Investments
        fields = '__all__'

class InvestmentRecordForm(forms.ModelForm):
    class Meta:
        model = InvestmentRecords
        fields = '__all__'

        widgets={
                    'date':forms.TextInput(attrs={'type':'date'})
                }