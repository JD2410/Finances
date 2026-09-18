from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='savings'),
    path('<int:accountPassed>', views.account, name='savings'),
    path('import/', views.processRecords, name='import'),
]