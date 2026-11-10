from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContactInquiryCreateView, AdminContactInquiryViewSet,
    SupportTicketViewSet, AddTicketMessageView, FAQViewSet
)

router = DefaultRouter()
router.register(r'admin/inquiries', AdminContactInquiryViewSet, basename='admin_inquiry')
router.register(r'support/tickets', SupportTicketViewSet, basename='support_ticket')
router.register(r'faqs', FAQViewSet, basename='faq')

urlpatterns = [
    path('contact/', ContactInquiryCreateView.as_view(), name='contact_inquiry'),
    path('support/tickets/<int:ticket_id>/reply/', AddTicketMessageView.as_view(), name='ticket_reply'),
    path('', include(router.urls)),
]
