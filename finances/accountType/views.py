from django.shortcuts import render
from .forms import TypeForm
from .models import Type

# Create your views here.
def index(request):
    
    createForm = TypeForm()

    if request.method == 'POST':
        formCheck = TypeForm(request.POST)
        if formCheck.is_valid():
            formCheck.save()


    accountTypes = Type.objects.all()

    return render (request, 'settings/accounttype.html', {
        'createFrom': createForm,
        'types': accountTypes,
    })