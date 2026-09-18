from django.urls import path
from . import views

urlpatterns = [
    path('type', views.index, name='accountType')
]