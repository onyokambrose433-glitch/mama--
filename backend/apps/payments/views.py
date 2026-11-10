from rest_framework import generics, viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from apps.accounts.permissions import IsAdminOrStaff
from apps.accounts.models import AuditLog
from apps.orders.models import Order, OrderStatusHistory
from .models import PaymentMethodConfig, PaymentTransaction, Refund
from .serializers import (
    PaymentMethodConfigSerializer, PaymentTransactionSerializer,
    RefundSerializer, PaymentInitiateSerializer, PaymentVerifySerializer
)

class PaymentMethodConfigViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodConfigSerializer
    pagination_class = None

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_or_staff:
            return PaymentMethodConfig.objects.all()
        return PaymentMethodConfig.objects.filter(is_enabled=True)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]


class PaymentInitiateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_number = serializer.validated_data['order_number']
        phone_number = serializer.validated_data.get('phone_number', '')

        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_status == Order.PaymentStatus.PAID:
            return Response({"detail": "This order is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create transaction
        txn = order.transactions.filter(status=PaymentTransaction.Status.PENDING).first()
        if not txn:
            ref = PaymentTransaction.generate_reference(order.order_number)
            txn = PaymentTransaction.objects.create(
                order=order,
                transaction_reference=ref,
                payment_method=order.payment_method,
                amount=order.total_amount,
                currency='UGX',
                phone_number=phone_number or order.recipient_phone,
                status=PaymentTransaction.Status.PENDING
            )
        elif phone_number:
            txn.phone_number = phone_number
            txn.save()

        # Get method configuration instructions
        config = PaymentMethodConfig.objects.filter(method_type=order.payment_method).first()

        instructions = config.instructions if config else "Complete your payment using the provided details."
        merchant_code = config.account_number_or_merchant_code if config else ""

        return Response({
            "order_number": order.order_number,
            "transaction_reference": txn.transaction_reference,
            "payment_method": order.payment_method,
            "amount": float(order.total_amount),
            "currency": "UGX",
            "phone_number": txn.phone_number,
            "merchant_code": merchant_code,
            "account_name": config.account_name if config else "Mama Shopping Center",
            "bank_name": config.bank_name if config else "",
            "instructions": instructions,
            "status": txn.status
        })


class PaymentVerifyView(APIView):
    """Customer submits their transaction proof or reference after making payment"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ref = serializer.validated_data['transaction_reference']
        ext_ref = serializer.validated_data.get('external_reference', '')

        try:
            txn = PaymentTransaction.objects.select_related('order').get(
                transaction_reference=ref, order__user=request.user
            )
        except PaymentTransaction.DoesNotExist:
            return Response({"detail": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        txn.external_reference = ext_ref
        txn.save()

        return Response({
            "message": "Payment confirmation received and is being verified.",
            "transaction": PaymentTransactionSerializer(txn).data
        })


class PaymentWebhookView(APIView):
    """
    Standard webhook endpoint for Uganda mobile money gateways (e.g., Flutterwave / MTN MoMo Open API / Beyonic).
    Accepts callback, validates reference, and updates payment state.
    """
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        payload = request.data
        ref = payload.get('tx_ref') or payload.get('reference') or payload.get('transaction_reference')
        external_id = payload.get('flw_ref') or payload.get('financialTransactionId') or payload.get('id', '')
        gateway_status = payload.get('status', '').lower()

        if not ref:
            return Response({"detail": "Missing transaction reference."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            txn = PaymentTransaction.objects.select_for_update().select_related('order').get(transaction_reference=ref)
        except PaymentTransaction.DoesNotExist:
            return Response({"detail": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        order = txn.order

        if gateway_status in ['successful', 'success', 'completed']:
            txn.status = PaymentTransaction.Status.SUCCESS
            txn.external_reference = str(external_id)
            txn.provider_response = payload
            txn.verified_at = timezone.now()
            txn.save()

            order.payment_status = Order.PaymentStatus.PAID
            if order.status in [Order.Status.PENDING, Order.Status.AWAITING_PAYMENT]:
                order.status = Order.Status.CONFIRMED
            order.save()

            OrderStatusHistory.objects.create(
                order=order,
                status=order.status,
                comment=f"Payment verified via webhook ({txn.payment_method}). External Ref: {external_id}"
            )
        elif gateway_status in ['failed', 'cancelled']:
            txn.status = PaymentTransaction.Status.FAILED
            txn.provider_response = payload
            txn.save()
            order.payment_status = Order.PaymentStatus.FAILED
            order.save()

        return Response({"status": "received"})


# Admin Payment Management
class AdminPaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        qs = PaymentTransaction.objects.all().select_related('order', 'verified_by')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        method_param = self.request.query_params.get('payment_method')
        if method_param:
            qs = qs.filter(payment_method=method_param)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                transaction_reference__icontains=search
            ) | qs.filter(
                external_reference__icontains=search
            ) | qs.filter(
                order__order_number__icontains=search
            )

        return qs.order_by('-created_at')


class AdminManualVerifyPaymentView(APIView):
    permission_classes = [IsAdminOrStaff]

    @transaction.atomic
    def post(self, request, pk):
        try:
            txn = PaymentTransaction.objects.select_for_update().select_related('order').get(pk=pk)
        except PaymentTransaction.DoesNotExist:
            return Response({"detail": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        ext_ref = request.data.get('external_reference', txn.external_reference)

        txn.status = PaymentTransaction.Status.SUCCESS
        txn.external_reference = ext_ref
        txn.verified_at = timezone.now()
        txn.verified_by = request.user
        txn.save()

        order = txn.order
        order.payment_status = Order.PaymentStatus.PAID
        if order.status in [Order.Status.PENDING, Order.Status.AWAITING_PAYMENT]:
            order.status = Order.Status.CONFIRMED
        order.save()

        OrderStatusHistory.objects.create(
            order=order,
            status=order.status,
            comment=f"Payment manually verified by {request.user}. Ref: {ext_ref}",
            updated_by=request.user
        )

        AuditLog.objects.create(
            user=request.user,
            action="PAYMENT_VERIFIED",
            target_model="PaymentTransaction",
            target_id=str(txn.id),
            details={"order_number": order.order_number, "amount": float(txn.amount)}
        )

        return Response(PaymentTransactionSerializer(txn).data)


class AdminRefundViewSet(viewsets.ModelViewSet):
    serializer_class = RefundSerializer
    permission_classes = [IsAdminOrStaff]
    queryset = Refund.objects.all().select_related('order', 'processed_by')

    def perform_create(self, serializer):
        refund = serializer.save(processed_by=self.request.user)
        order = refund.order
        order.status = Order.Status.REFUNDED
        order.payment_status = Order.PaymentStatus.REFUNDED
        order.save()

        OrderStatusHistory.objects.create(
            order=order,
            status=Order.Status.REFUNDED,
            comment=f"Refund of UGX {refund.amount:,.0f} processed. Reason: {refund.reason}",
            updated_by=self.request.user
        )
