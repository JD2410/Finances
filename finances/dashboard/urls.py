from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="home"),
    path("getTransactionsDate", views.get_transactions_date, name="getTransactionsDate"),
    path("getGraph", views.get_graph, name="getGraphDate")
]