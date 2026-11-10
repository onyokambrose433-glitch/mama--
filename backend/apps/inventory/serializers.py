from rest_framework import serializers
from .models import StockMovement
from apps.catalog.models import Product

class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.__str__', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'movement_type',
            'movement_type_display', 'quantity', 'previous_stock', 'new_stock',
            'unit_cost', 'reference_no', 'batch_no', 'expiry_date', 'notes',
            'recorded_by', 'recorded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'previous_stock', 'new_stock', 'recorded_by', 'created_at']


class StockAdjustmentSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    movement_type = serializers.ChoiceField(choices=StockMovement.MovementType.choices)
    quantity = serializers.IntegerField(required=True)
    unit_cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    reference_no = serializers.CharField(required=False, allow_blank=True, default='')
    batch_no = serializers.CharField(required=False, allow_blank=True, default='')
    expiry_date = serializers.DateField(required=False, allow_null=True, default=None)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_quantity(self, value):
        if value == 0:
            raise serializers.ValidationError("Quantity cannot be zero.")
        return value


class InventoryProductOverviewSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    total_cost_valuation = serializers.SerializerMethodField()
    total_retail_valuation = serializers.SerializerMethodField()
    stock_status = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'category_name', 'unit',
            'cost_price', 'selling_price', 'stock_quantity', 'low_stock_threshold',
            'stock_status', 'total_cost_valuation', 'total_retail_valuation', 'is_active'
        ]

    def get_total_cost_valuation(self, obj):
        return float(obj.cost_price * max(0, obj.stock_quantity))

    def get_total_retail_valuation(self, obj):
        return float(obj.current_price * max(0, obj.stock_quantity))

    def get_stock_status(self, obj):
        if obj.stock_quantity <= 0:
            return "OUT_OF_STOCK"
        elif obj.stock_quantity <= obj.low_stock_threshold:
            return "LOW_STOCK"
        return "IN_STOCK"
