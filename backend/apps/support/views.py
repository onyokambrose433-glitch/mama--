from rest_framework import generics, viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.permissions import IsAdminOrStaff
from .models import ContactInquiry, SupportTicket, TicketMessage, FAQ
from .serializers import (
    ContactInquirySerializer, SupportTicketSerializer,
    TicketMessageSerializer, FAQSerializer
)

class ContactInquiryCreateView(generics.CreateAPIView):
    serializer_class = ContactInquirySerializer
    permission_classes = [permissions.AllowAny]


class AdminContactInquiryViewSet(viewsets.ModelViewSet):
    serializer_class = ContactInquirySerializer
    permission_classes = [IsAdminOrStaff]
    queryset = ContactInquiry.objects.all().order_by('-created_at')


class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_or_staff:
            return SupportTicket.objects.all().prefetch_related('messages')
        if self.request.user.is_authenticated:
            return SupportTicket.objects.filter(user=self.request.user).prefetch_related('messages')
        return SupportTicket.objects.none()

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        ticket = serializer.save(user=self.request.user)
        # Create initial message if message content provided
        initial_msg = self.request.data.get('message')
        if initial_msg:
            TicketMessage.objects.create(
                ticket=ticket,
                sender=self.request.user,
                is_staff_reply=False,
                message=initial_msg
            )


class AddTicketMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ticket_id):
        user = request.user
        try:
            if user.is_admin_or_staff:
                ticket = SupportTicket.objects.get(id=ticket_id)
            else:
                ticket = SupportTicket.objects.get(id=ticket_id, user=user)
        except SupportTicket.DoesNotExist:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response({"detail": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        is_staff = user.is_admin_or_staff
        msg = TicketMessage.objects.create(
            ticket=ticket,
            sender=user,
            is_staff_reply=is_staff,
            message=message_text
        )

        # Update ticket status
        if is_staff:
            ticket.status = SupportTicket.Status.IN_PROGRESS
        else:
            if ticket.status == SupportTicket.Status.RESOLVED:
                ticket.status = SupportTicket.Status.OPEN
        ticket.save()

        return Response(TicketMessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class FAQViewSet(viewsets.ModelViewSet):
    serializer_class = FAQSerializer
    pagination_class = None

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_or_staff:
            return FAQ.objects.all()
        return FAQ.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]
