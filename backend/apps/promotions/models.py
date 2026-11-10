from django.db import models
from django.utils import timezone
from decimal import Decimal

class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'percentage', 'Percentage (%)'
        FIXED = 'fixed', 'Fixed Amount (UGX)'

    code = models.CharField(max_length=40, unique=True)
    description = models.CharField(max_length=200, blank=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text="e.g. 15 for 15% or 5000 for 5,000 UGX")
    min_purchase_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), help_text="Minimum cart subtotal in UGX")
    max_discount_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Maximum discount cap for percentage in UGX")
    max_uses = models.PositiveIntegerField(null=True, blank=True, help_text="Total allowed redemptions across all customers")
    times_used = models.PositiveIntegerField(default=0)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False, "This coupon is no longer active."
        if now < self.start_date:
            return False, "This coupon campaign has not started yet."
        if now > self.end_date:
            return False, "This coupon has expired."
        if self.max_uses is not None and self.times_used >= self.max_uses:
            return False, "This coupon has reached its maximum usage limit."
        return True, "Valid"

    def calculate_discount(self, subtotal):
        valid, msg = self.is_valid
        if not valid:
            return Decimal('0.00'), msg
        if subtotal < self.min_purchase_amount:
            return Decimal('0.00'), f"Minimum order amount of UGX {self.min_purchase_amount:,.0f} required for this coupon."

        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = (subtotal * self.discount_value) / Decimal('100.00')
            if self.max_discount_amount and discount > self.max_discount_amount:
                discount = self.max_discount_amount
        else:
            discount = min(self.discount_value, subtotal)

        return round(discount, 2), "Applied"

    def __str__(self):
        return f"{self.code} ({self.get_discount_type_display()} {self.discount_value})"
