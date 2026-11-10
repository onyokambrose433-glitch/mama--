from rest_framework import serializers
from .models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    times_used = serializers.IntegerField(read_only=True)
    is_valid_tuple = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_purchase_amount', 'max_discount_amount', 'max_uses',
            'times_used', 'start_date', 'end_date', 'is_active', 'is_valid_tuple'
        ]
        read_only_fields = ['id', 'times_used']

    def get_is_valid_tuple(self, obj):
        valid, msg = obj.is_valid
        return {"valid": valid, "message": msg}


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
