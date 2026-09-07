from django.db import models
from datetime import date

# Create your models here.
class Investments(models.Model):
    name = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class InvestmentRecords(models.Model):
    description = models.CharField(max_length=256, null=True, blank=True)
    value = models.DecimalField(decimal_places=2, max_digits=11)
    date = models.DateField(default=date.today)
    investment = models.ForeignKey(Investments, on_delete=models.CASCADE, related_name="InvestmentName")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
            return self.investment.name + ' - ' + str(self.value)