from django.shortcuts import render
from django.contrib import messages

from .forms import TypeForm
from .models import Type

# Create your views here.
def index(request):
    
    form = TypeForm()

    if request.method == 'POST':
        if 'typeId' in request.POST:
            print(request.POST)
            accumulate = False
            if 'accumulate' in request.POST:
                accumulate = True
            try:
                get_update_form = Type.objects.get(id=request.POST['typeId'])
                get_update_form.name = request.POST['name']
                get_update_form.accumulate = bool(accumulate)
                get_update_form.save()
                messages.success(request, "Account type updated")
            except Type.DoesNotExist:
                messages.warning(request, "Could not be found")
        elif 'deleteId' in request.POST:
            try:
                get_record = Type.objects.get(id=request.POST['deleteId'])
                get_record.delete()
                messages.warning(request, "Account Type successfully deleted")
            except Type.DoesNotExist:
                messages.warning(request, "Account Type doesn't exist")
                
        else:
            check_form = TypeForm(request.POST)
            if check_form.is_valid():
                check_form.save()


    account_types = Type.objects.all()

    return render (request, 'accounttype.html', {
        'createFrom': form,
        'types': account_types,
    })