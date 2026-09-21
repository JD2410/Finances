from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="home"),
    path("getTransactionsDate", views.getTransactionsDate, name="getTransactionsDate")
]