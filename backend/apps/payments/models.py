import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.orders.models import Order

class PaymentMethodConfig(models.Model):
    class MethodType(models.TextChoices):
        MTN_MOMO = 'mtn_momo', 'MTN Mobile Money'
        AIRTEL_MONEY = 'airtel_money', 'Airtel Money'
        BANK_TRANSFER = 'bank_transfer', 'Bank Transfer / Deposit'
        CASH_ON_DELIVERY = 'cash_on_delivery', 'Cash on Delivery'

    method_type = models.CharField(max_length=30, choices=MethodType.choices, unique=True)
    display_name = models.CharField(max_length=100)
    is_enabled = models.BooleanField(default=True)
    instructions = models.TextField(help_text="Customer payment instructions")
    account_number_or_merchant_code = models.CharField(max_length=100, blank=True, help_text="Merchant code / Till / Account number")
    account_name = models.CharField(max_length=150, blank=True, default="Mama Shopping Center Ltd")
    bank_name = models.CharField(max_length=100, blank=True, help_text="e.g. Stanbic Bank Uganda, Centenary Bank")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "Active" if self.is_enabled else "Disabled"
        return f"{self.display_name} ({status})"


class PaymentTransaction(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Verification'
        SUCCESS = 'success', 'Successful / Verified'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    transaction_reference = models.CharField(max_length=100, unique=True, db_index=True)
    external_reference = models.CharField(max_length=150, blank=True, help_text="Mobile money transaction ID or Bank reference")
    payment_method = models.CharField(max_length=30)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=6, default='UGX')
    phone_number = models.CharField(max_length=30, blank=True, help_text="Payer phone number for MoMo")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    provider_response = models.JSONField(default=dict, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_payments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def generate_reference(cls, order_number):
        unique_suffix = uuid.uuid4().hex[:8].upper()
        return f"PAY-{order_number}-{unique_suffix}"

    def __str__(self):
        return f"{self.transaction_reference} - {self.payment_method} - UGX {self.amount:,.0f} ({self.status})"


class Refund(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        REJECTED = 'rejected', 'Rejected'

    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='refunds')
    transaction = models.ForeignKey(PaymentTransaction, on_delete=models.PROTECT, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_refunds'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Refund for {self.order.order_number}: UGX {self.amount:,.0f} ({self.status})"
