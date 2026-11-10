from rest_framework import serializers
from .models import ContactInquiry, SupportTicket, TicketMessage, FAQ

class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'is_resolved', 'admin_notes', 'created_at']
        read_only_fields = ['id', 'is_resolved', 'admin_notes', 'created_at']


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.__str__', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'is_staff_reply', 'message', 'created_at']
        read_only_fields = ['id', 'ticket', 'sender', 'sender_name', 'is_staff_reply', 'created_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.__str__', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True, default='')

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_number', 'user', 'user_name', 'user_email', 'order',
            'order_number', 'subject', 'priority', 'status', 'messages',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ticket_number', 'user', 'created_at', 'updated_at']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'order', 'is_active']
