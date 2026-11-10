from django.db import models
from django.conf import settings
from decimal import Decimal

class Expense(models.Model):
    class Category(models.TextChoices):
        UTILITIES = 'utilities', 'Utilities (Electricity, Water, Internet)'
        RENT = 'rent', 'Store & Warehouse Rent'
        TRANSPORT_FUEL = 'transport_fuel', 'Delivery Fuel & Transport'
        PACKAGING = 'packaging', 'Packaging Bags & Boxes'
        SALARIES = 'salaries', 'Staff Salaries & Wages'
        SUPPLIES = 'supplies', 'Cleaning & Store Supplies'
        MARKETING = 'marketing', 'Marketing & Promotions'
        MAINTENANCE = 'maintenance', 'Equipment & Vehicle Repairs'
        OTHER = 'other', 'Miscellaneous / Other'

    category = models.CharField(max_length=40, choices=Category.choices, default=Category.OTHER)
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Amount in UGX")
    expense_date = models.DateField()
    notes = models.TextField(blank=True)
    receipt_reference = models.CharField(max_length=100, blank=True, help_text="Receipt, voucher or invoice number")
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_expenses'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expense_date', '-created_at']

    def __str__(self):
        return f"{self.title} - UGX {self.amount:,.0f} ({self.get_category_display()})"
