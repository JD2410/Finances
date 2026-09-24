from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='accounts'),
    path('<int:accountPassed>', views.account, name='accounts'),
    path('import/', views.processRecords, name='import'),
    path('getBulkTransactions/', views.get_bulk_transactions, name='getBulkTransactions'),
]