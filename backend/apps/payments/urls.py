from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentMethodConfigViewSet, PaymentInitiateView, PaymentVerifyView,
    PaymentWebhookView, AdminPaymentTransactionViewSet, AdminManualVerifyPaymentView,
    AdminRefundViewSet
)

router = DefaultRouter()
router.register(r'payments/methods', PaymentMethodConfigViewSet, basename='payment_methods')
router.register(r'admin/payments/transactions', AdminPaymentTransactionViewSet, basename='admin_transactions')
router.register(r'admin/payments/refunds', AdminRefundViewSet, basename='admin_refunds')

urlpatterns = [
    path('payments/initiate/', PaymentInitiateView.as_view(), name='payment_initiate'),
    path('payments/verify/', PaymentVerifyView.as_view(), name='payment_verify'),
    path('payments/webhook/', PaymentWebhookView.as_view(), name='payment_webhook'),
    path('admin/payments/transactions/<int:pk>/verify/', AdminManualVerifyPaymentView.as_view(), name='admin_verify_payment'),
    path('', include(router.urls)),
]
