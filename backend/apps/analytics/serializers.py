from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.__str__', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_display', 'title', 'amount',
            'expense_date', 'notes', 'receipt_reference', 'recorded_by',
            'recorded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'recorded_by', 'created_at']

    def create(self, validated_data):
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)
