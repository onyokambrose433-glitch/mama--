from rest_framework import serializers
from decimal import Decimal
from .models import DeliveryZone, Cart, CartItem, Order, OrderItem, OrderStatusHistory
from apps.catalog.serializers import ProductListSerializer
from apps.catalog.models import Product
from apps.promotions.models import Coupon

class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = [
            'id', 'name', 'description', 'delivery_fee', 'min_order_amount',
            'free_delivery_threshold', 'estimated_delivery_time', 'is_active',
            'is_pickup', 'order'
        ]


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), source='product', write_only=True
    )
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'unit_price', 'line_total']
        read_only_fields = ['id', 'unit_price', 'line_total']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'subtotal', 'total_items', 'updated_at']


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(default=1, min_value=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(required=True, min_value=1)


class SyncCartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'unit',
            'unit_price', 'quantity', 'subtotal'
        ]


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.__str__', read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'comment', 'updated_by_name', 'timestamp']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    delivery_zone_name = serializers.CharField(source='delivery_zone.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    assigned_rider_name = serializers.CharField(source='assigned_rider.__str__', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'status', 'status_display', 'payment_status',
            'payment_status_display', 'payment_method', 'payment_method_display',
            'delivery_zone', 'delivery_zone_name', 'delivery_type',
            'recipient_name', 'recipient_phone', 'recipient_email', 'street_address',
            'division_or_area', 'city', 'delivery_instructions', 'subtotal',
            'discount_amount', 'delivery_fee', 'total_amount', 'assigned_rider',
            'assigned_rider_name', 'internal_notes', 'cancel_reason', 'items',
            'status_history', 'created_at', 'updated_at'
        ]
        read_only_fields = fields


class OrderCreateSerializer(serializers.Serializer):
    delivery_zone_id = serializers.IntegerField(required=True)
    delivery_type = serializers.ChoiceField(choices=['delivery', 'pickup'], default='delivery')
    recipient_name = serializers.CharField(max_length=150, required=True)
    recipient_phone = serializers.CharField(max_length=30, required=True)
    recipient_email = serializers.EmailField(required=False, allow_blank=True, default='')
    street_address = serializers.CharField(max_length=255, required=True)
    division_or_area = serializers.CharField(max_length=120, required=True)
    city = serializers.CharField(max_length=100, default="Kampala")
    delivery_instructions = serializers.CharField(required=False, allow_blank=True, default='')
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices, required=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True, default='')


class AdminOrderUpdateSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')

    class Meta:
        model = Order
        fields = ['status', 'payment_status', 'assigned_rider', 'internal_notes', 'comment']
