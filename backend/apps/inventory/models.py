from django.db import models
from django.conf import settings
from decimal import Decimal
from apps.catalog.models import Product

class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        STOCK_IN = 'stock_in', 'Stock In / Goods Received'
        STOCK_OUT = 'stock_out', 'Stock Out / Manual Dispatch'
        SALE = 'sale', 'Customer Sale'
        RETURN = 'return', 'Customer Return / Restock'
        DAMAGED = 'damaged', 'Damaged Goods'
        EXPIRED = 'expired', 'Expired Goods'
        ADJUSTMENT = 'adjustment', 'Stock Take Adjustment'

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(max_length=30, choices=MovementType.choices)
    quantity = models.IntegerField(help_text="Positive for addition, negative for deduction")
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    unit_cost = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'),
        help_text="Cost per unit in UGX at time of movement"
    )
    reference_no = models.CharField(max_length=100, blank=True, help_text="PO number, Order ref, or Count ref")
    batch_no = models.CharField(max_length=60, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_stock_movements'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        sign = "+" if self.quantity > 0 else ""
        return f"{self.product.name}: {sign}{self.quantity} ({self.get_movement_type_display()})"
