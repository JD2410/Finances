from django.shortcuts import render
from django.contrib import messages

from .forms import TypeForm
from .models import Type

# Create your views here.
def index(request):
    
    createForm = TypeForm()

    if request.method == 'POST':
        if 'typeId' in request.POST:
            print(request.POST)
            accumulate = False
            if 'accumulate' in request.POST:
                accumulate = True
            try:
                getUpdateForm = Type.objects.get(id=request.POST['typeId'])
                getUpdateForm.name = request.POST['name']
                getUpdateForm.accumulate = bool(accumulate)
                getUpdateForm.save()
                messages.success(request, "Account type updated")
            except Type.DoesNotExist:
                messages.warning(request, "Could not be found")
        elif 'deleteId' in request.POST:
            try:
                getRecord = Type.objects.get(id=request.POST['deleteId'])
                getRecord.delete()
                messages.warning(request, "Account Type successfully deleted")
            except Type.DoesNotExist:
                messages.warning(request, "Account Type doesn't exist")
                
        else:
            formCheck = TypeForm(request.POST)
            if formCheck.is_valid():
                formCheck.save()


    accountTypes = Type.objects.all()

    return render (request, 'settings/accounttype.html', {
        'createFrom': createForm,
        'types': accountTypes,
    })