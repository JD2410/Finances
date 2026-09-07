from django.shortcuts import render 
from .forms import InvestentForm, InvestmentRecordForm
from .models import Investments, InvestmentRecords
from django.contrib import messages

# Create your views here.
def index(request):
    investmentForm = InvestentForm()
    investmentRecordForm = InvestmentRecordForm()

    if request.method == "POST":

        if 'addInvestment' in request.POST:
            investmentForm = InvestentForm(request.POST)
            if investmentForm.is_valid():
                investmentForm.save()
        elif 'addInvestmentRecord' in request.POST:
            investmentRecordForm = InvestmentRecordForm(request.POST)
            if investmentRecordForm.is_valid():
                investmentRecordForm.save()
        elif 'deleteInvestment' in request.POST:
            try:
                del_invest = Investments.objects.get(id=request.POST['investmentId'])
                del_invest.delete()
                messages.warning(request, 'Investment Deleted')
            except Investments.DoesNotExist:
                messages.warning(request, 'Investment was not found or was already deleted.')
        elif 'deleteInvestmentRecord' in request.POST:
            try:
                getDeleteRecord = InvestmentRecords.objects.get(id=request.POST['deleteInvestmentRecord'])
                getDeleteRecord.delete()
                messages.warning(request, 'Investment Record Deleted')
            except InvestmentRecords.DoesNotExist:
                messages.warning(request, 'Investment records was not found or was already deleted')

    investments = Investments.objects.all()
    investmentRecords = InvestmentRecords.objects.select_related('investment').all()

    return render(request, 'investments.html', {
        'investmentForm': investmentForm,
        'investmentRecordForm': investmentRecordForm,
        'investments': investments,
        'investmentRecords': investmentRecords
    })