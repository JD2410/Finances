from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='savings'),
    path('import/', views.processRecords, name='processRecords'),
]