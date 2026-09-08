from django.db import models
from datetime import date
from accountType.models import Type
# Create your models here.

class Accounts(models.Model):
    name = models.CharField(max_length=255, default="Savings Account")
    accountType = models.ForeignKey(Type, on_delete=models.PROTECT, related_name='AccountType')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Transactions(models.Model):
    name = models.CharField(max_length=255, default="Transaction")
    amount = models.DecimalField(decimal_places=2, max_digits=11, default=100.00)
    date = models.DateField(default=date.today)
    accountId = models.ForeignKey(Accounts, on_delete=models.CASCADE, related_name="TransactionName")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.accountId) + " (" + str(self.date) + "): " + str(self.amount)
    
    