import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.catalog.models import Product
from apps.promotions.models import Coupon

class DeliveryZone(models.Model):
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=255, blank=True, help_text="Coverage areas and divisions")
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), help_text="Delivery fee in UGX")
    min_order_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), help_text="Minimum order value in UGX")
    free_delivery_threshold = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="Orders above this amount qualify for free delivery (UGX)"
    )
    estimated_delivery_time = models.CharField(max_length=100, default="Within 2-3 hours")
    is_active = models.BooleanField(default=True)
    is_pickup = models.BooleanField(default=False, help_text="True if this option is store pickup")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def calculate_fee(self, subtotal):
        if self.is_pickup:
            return Decimal('0.00')
        if self.free_delivery_threshold and subtotal >= self.free_delivery_threshold:
            return Decimal('0.00')
        return self.delivery_fee

    def __str__(self):
        if self.is_pickup:
            return f"{self.name} (Free Pickup)"
        return f"{self.name} - UGX {self.delivery_fee:,.0f}"


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='cart')
    session_key = models.CharField(max_length=100, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart {self.id} - {'User: ' + self.user.email if self.user else 'Session: ' + self.session_key}"

    @property
    def subtotal(self):
        total = Decimal('0.00')
        for item in self.items.all():
            total += item.line_total
        return total

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product')

    @property
    def unit_price(self):
        return self.product.current_price

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Confirmation'
        AWAITING_PAYMENT = 'awaiting_payment', 'Awaiting Payment'
        PAID = 'paid', 'Paid'
        PROCESSING = 'processing', 'Processing'
        CONFIRMED = 'confirmed', 'Order Confirmed'
        PACKED = 'packed', 'Packed & Ready'
        READY_FOR_PICKUP = 'ready_for_pickup', 'Ready for Store Pickup'
        OUT_FOR_DELIVERY = 'out_for_delivery', 'Out for Delivery'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'

    class PaymentStatus(models.TextChoices):
        UNPAID = 'unpaid', 'Unpaid'
        PENDING = 'pending', 'Payment Pending'
        PAID = 'paid', 'Payment Verified'
        FAILED = 'failed', 'Payment Failed'
        REFUNDED = 'refunded', 'Refunded'

    class PaymentMethod(models.TextChoices):
        MTN_MOMO = 'mtn_momo', 'MTN Mobile Money'
        AIRTEL_MONEY = 'airtel_money', 'Airtel Money'
        BANK_TRANSFER = 'bank_transfer', 'Bank Transfer / Deposit'
        CASH_ON_DELIVERY = 'cash_on_delivery', 'Cash on Delivery'

    order_number = models.CharField(max_length=36, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=30, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    payment_method = models.CharField(max_length=30, choices=PaymentMethod.choices)

    delivery_zone = models.ForeignKey(DeliveryZone, on_delete=models.SET_NULL, null=True, blank=True, related_name='zone_orders')
    delivery_type = models.CharField(max_length=20, default='delivery', choices=[('delivery', 'Home / Office Delivery'), ('pickup', 'Store Pickup')])

    # Customer & address snapshot at order placement
    recipient_name = models.CharField(max_length=150)
    recipient_phone = models.CharField(max_length=30)
    recipient_email = models.EmailField(blank=True)
    street_address = models.CharField(max_length=255)
    division_or_area = models.CharField(max_length=120)
    city = models.CharField(max_length=100, default="Kampala")
    delivery_instructions = models.TextField(blank=True)

    # Financial breakdown (in UGX)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    # Operational notes
    assigned_rider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_deliveries'
    )
    internal_notes = models.TextField(blank=True)
    cancel_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def generate_order_number(cls):
        date_str = timezone.now().strftime('%Y%m%d')
        unique_suffix = uuid.uuid4().hex[:6].upper()
        return f"MAMA-{date_str}-{unique_suffix}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)

    @property
    def cost_of_goods_sold(self):
        """Used for real profit calculation: sum of unit_cost_price * quantity for items"""
        return sum(item.unit_cost_price * item.quantity for item in self.items.all())

    @property
    def gross_profit(self):
        """Gross profit = (subtotal - discount_amount) - cost_of_goods_sold"""
        net_sales = self.subtotal - self.discount_amount
        return net_sales - self.cost_of_goods_sold

    def __str__(self):
        return f"{self.order_number} ({self.recipient_name} - UGX {self.total_amount:,.0f})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    product_sku = models.CharField(max_length=60)
    unit = models.CharField(max_length=30)
    unit_cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        if not self.subtotal:
            self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_number}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=30)
    comment = models.TextField(blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.order.order_number} -> {self.status} at {self.timestamp:%Y-%m-%d %H:%M}"
