from rest_framework import serializers
from .models import PaymentMethodConfig, PaymentTransaction, Refund

class PaymentMethodConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethodConfig
        fields = [
            'id', 'method_type', 'display_name', 'is_enabled', 'instructions',
            'account_number_or_merchant_code', 'account_name', 'bank_name'
        ]


class PaymentTransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    recipient_name = serializers.CharField(source='order.recipient_name', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'order', 'order_number', 'recipient_name', 'transaction_reference',
            'external_reference', 'payment_method', 'amount', 'currency', 'phone_number',
            'status', 'status_display', 'provider_response', 'verified_at', 'verified_by',
            'verified_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'transaction_reference', 'created_at', 'updated_at']


class RefundSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.__str__', read_only=True)

    class Meta:
        model = Refund
        fields = [
            'id', 'order', 'order_number', 'transaction', 'amount',
            'reason', 'status', 'processed_by', 'processed_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'processed_by', 'created_at']


class PaymentInitiateSerializer(serializers.Serializer):
    order_number = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, default='')


class PaymentVerifySerializer(serializers.Serializer):
    transaction_reference = serializers.CharField(required=True)
    external_reference = serializers.CharField(required=False, allow_blank=True, default='')
