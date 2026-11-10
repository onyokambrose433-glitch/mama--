from rest_framework import generics, viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal

from apps.accounts.permissions import IsAdminOrStaff
from apps.accounts.models import AuditLog
from apps.catalog.models import Product
from apps.inventory.models import StockMovement
from apps.promotions.models import Coupon
from apps.payments.models import PaymentTransaction
from .models import DeliveryZone, Cart, CartItem, Order, OrderItem, OrderStatusHistory
from .serializers import (
    DeliveryZoneSerializer, CartSerializer, AddToCartSerializer,
    UpdateCartItemSerializer, SyncCartItemSerializer, OrderSerializer,
    OrderCreateSerializer, AdminOrderUpdateSerializer
)

def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart
    session_key = request.session.session_key
    if not session_key:
        request.session.save()
        session_key = request.session.session_key
    cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
    return cart


class DeliveryZoneViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryZoneSerializer
    pagination_class = None

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_or_staff:
            return DeliveryZone.objects.all()
        return DeliveryZone.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart).data)


class AddToCartView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({"detail": "Product is not available."}, status=status.HTTP_404_NOT_FOUND)

        if product.stock_quantity <= 0:
            return Response({"detail": f"'{product.name}' is out of stock."}, status=status.HTTP_400_BAD_REQUEST)

        cart = get_or_create_cart(request)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        new_qty = quantity if created else item.quantity + quantity
        if new_qty > product.stock_quantity:
            item.quantity = product.stock_quantity
            item.save()
            return Response({
                "detail": f"Only {product.stock_quantity} units available in stock for '{product.name}'. Quantity adjusted.",
                "cart": CartSerializer(cart).data
            }, status=status.HTTP_200_OK)

        item.quantity = new_qty
        item.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class UpdateCartItemView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data['quantity']

        cart = get_or_create_cart(request)
        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

        if quantity > item.product.stock_quantity:
            return Response({
                "detail": f"Only {item.product.stock_quantity} units available for '{item.product.name}'."
            }, status=status.HTTP_400_BAD_REQUEST)

        item.quantity = quantity
        item.save()
        return Response(CartSerializer(cart).data)


class RemoveCartItemView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, item_id):
        cart = get_or_create_cart(request)
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        return Response(CartSerializer(cart).data)


class ClearCartView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        cart = get_or_create_cart(request)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)


class SyncCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        items_data = request.data.get('items', [])
        cart, _ = Cart.objects.get_or_create(user=request.user)

        for item_data in items_data:
            pid = item_data.get('product_id')
            qty = int(item_data.get('quantity', 1))
            try:
                product = Product.objects.get(id=pid, is_active=True)
                if product.stock_quantity <= 0:
                    continue
                available_qty = min(qty, product.stock_quantity)
                citem, created = CartItem.objects.get_or_create(cart=cart, product=product)
                if created:
                    citem.quantity = available_qty
                else:
                    citem.quantity = min(citem.quantity + available_qty, product.stock_quantity)
                citem.save()
            except Product.DoesNotExist:
                continue

        return Response(CartSerializer(cart).data)


class OrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)
        cart_items = cart.items.select_related('product').all()

        if not cart_items.exists():
            return Response({"detail": "Your shopping cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Validate Delivery Zone
        try:
            zone = DeliveryZone.objects.get(id=data['delivery_zone_id'], is_active=True)
        except DeliveryZone.DoesNotExist:
            return Response({"detail": "Invalid delivery zone selected."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Check stock of all items using select_for_update to prevent race conditions & overselling
        products_to_update = {}
        for item in cart_items:
            product = Product.objects.select_for_update().get(id=item.product.id)
            if not product.is_active:
                return Response({"detail": f"Product '{product.name}' is no longer available."}, status=status.HTTP_400_BAD_REQUEST)
            if product.stock_quantity < item.quantity:
                return Response({
                    "detail": f"Insufficient stock for '{product.name}'. Requested: {item.quantity}, Available: {product.stock_quantity}."
                }, status=status.HTTP_400_BAD_REQUEST)
            products_to_update[item.id] = product

        subtotal = cart.subtotal
        if subtotal < zone.min_order_amount:
            return Response({
                "detail": f"Minimum order amount for {zone.name} is UGX {zone.min_order_amount:,.0f}."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Handle Coupon if present
        coupon_obj = None
        discount_amount = Decimal('0.00')
        coupon_code = data.get('coupon_code', '').strip().upper()
        if coupon_code:
            try:
                coupon_obj = Coupon.objects.select_for_update().get(code=coupon_code)
                disc, msg = coupon_obj.calculate_discount(subtotal)
                if disc > 0:
                    discount_amount = disc
                    coupon_obj.times_used += 1
                    coupon_obj.save()
            except Coupon.DoesNotExist:
                pass

        # 4. Calculate Delivery Fee
        delivery_fee = zone.calculate_fee(subtotal) if data.get('delivery_type') == 'delivery' else Decimal('0.00')
        total_amount = max(Decimal('0.00'), (subtotal - discount_amount) + delivery_fee)

        # 5. Create Order
        order = Order.objects.create(
            user=user,
            status=Order.Status.AWAITING_PAYMENT if data['payment_method'] != Order.PaymentMethod.CASH_ON_DELIVERY else Order.Status.CONFIRMED,
            payment_status=Order.PaymentStatus.UNPAID,
            payment_method=data['payment_method'],
            delivery_zone=zone,
            delivery_type=data.get('delivery_type', 'delivery'),
            recipient_name=data['recipient_name'],
            recipient_phone=data['recipient_phone'],
            recipient_email=data.get('recipient_email', '') or user.email,
            street_address=data['street_address'],
            division_or_area=data['division_or_area'],
            city=data.get('city', 'Kampala'),
            delivery_instructions=data.get('delivery_instructions', ''),
            subtotal=subtotal,
            discount_amount=discount_amount,
            coupon=coupon_obj,
            delivery_fee=delivery_fee,
            total_amount=total_amount
        )

        # 6. Create Order Items & Deduct Stock Atomically
        for item in cart_items:
            product = products_to_update[item.id]
            prev_stock = product.stock_quantity
            new_stock = prev_stock - item.quantity
            product.stock_quantity = new_stock
            product.save()

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_sku=product.sku,
                unit=product.get_unit_display(),
                unit_cost_price=product.cost_price,
                unit_price=product.current_price,
                quantity=item.quantity,
                subtotal=product.current_price * item.quantity
            )

            # Record inventory movement of type SALE
            StockMovement.objects.create(
                product=product,
                movement_type=StockMovement.MovementType.SALE,
                quantity=-item.quantity,
                previous_stock=prev_stock,
                new_stock=new_stock,
                unit_cost=product.cost_price,
                reference_no=order.order_number,
                notes=f"Customer order {order.order_number}",
                recorded_by=user
            )

        # 7. Record Order Status History
        OrderStatusHistory.objects.create(
            order=order,
            status=order.status,
            comment=f"Order placed with payment method: {order.get_payment_method_display()}",
            updated_by=user
        )

        # 8. Create Payment Transaction Record
        ref = PaymentTransaction.generate_reference(order.order_number)
        PaymentTransaction.objects.create(
            order=order,
            transaction_reference=ref,
            payment_method=order.payment_method,
            amount=order.total_amount,
            currency='UGX',
            phone_number=order.recipient_phone,
            status=PaymentTransaction.Status.PENDING
        )

        # 9. Clear customer's cart
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class CustomerOrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items', 'status_history')


class CustomerOrderDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items', 'status_history')


class CustomerOrderCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, order_number):
        try:
            order = Order.objects.select_for_update().get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in [Order.Status.PENDING, Order.Status.AWAITING_PAYMENT]:
            return Response({
                "detail": f"Order cannot be cancelled in '{order.get_status_display()}' state. Contact customer support."
            }, status=status.HTTP_400_BAD_REQUEST)

        order.status = Order.Status.CANCELLED
        order.cancel_reason = request.data.get('reason', 'Cancelled by customer')
        order.save()

        # Restore inventory
        for item in order.items.all():
            product = Product.objects.select_for_update().get(id=item.product.id)
            prev_stock = product.stock_quantity
            new_stock = prev_stock + item.quantity
            product.stock_quantity = new_stock
            product.save()

            StockMovement.objects.create(
                product=product,
                movement_type=StockMovement.MovementType.RETURN,
                quantity=item.quantity,
                previous_stock=prev_stock,
                new_stock=new_stock,
                unit_cost=item.unit_cost_price,
                reference_no=order.order_number,
                notes=f"Order {order.order_number} cancelled by customer",
                recorded_by=request.user
            )

        OrderStatusHistory.objects.create(
            order=order,
            status=Order.Status.CANCELLED,
            comment=f"Cancelled by customer. Reason: {order.cancel_reason}",
            updated_by=request.user
        )

        return Response(OrderSerializer(order).data)


# Admin Order Management
class AdminOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrStaff]
    lookup_field = 'order_number'

    def get_queryset(self):
        qs = Order.objects.all().select_related('user', 'delivery_zone', 'assigned_rider').prefetch_related('items', 'status_history')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        payment_status_param = self.request.query_params.get('payment_status')
        if payment_status_param:
            qs = qs.filter(payment_status=payment_status_param)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                order_number__icontains=search
            ) | qs.filter(
                recipient_name__icontains=search
            ) | qs.filter(
                recipient_phone__icontains=search
            ) | qs.filter(
                user__email__icontains=search
            )

        return qs.order_by('-created_at')

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        order = self.get_object()
        serializer = AdminOrderUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data.get('status')
        old_status = order.status
        comment = serializer.validated_data.pop('comment', '')

        updated_order = serializer.save()

        if new_status and new_status != old_status:
            OrderStatusHistory.objects.create(
                order=updated_order,
                status=new_status,
                comment=comment or f"Status changed from {old_status} to {new_status}",
                updated_by=request.user
            )

            # If order was cancelled by admin, restore inventory
            if new_status == Order.Status.CANCELLED and old_status != Order.Status.CANCELLED:
                for item in updated_order.items.all():
                    product = Product.objects.select_for_update().get(id=item.product.id)
                    prev_stock = product.stock_quantity
                    new_stock = prev_stock + item.quantity
                    product.stock_quantity = new_stock
                    product.save()

                    StockMovement.objects.create(
                        product=product,
                        movement_type=StockMovement.MovementType.RETURN,
                        quantity=item.quantity,
                        previous_stock=prev_stock,
                        new_stock=new_stock,
                        unit_cost=item.unit_cost_price,
                        reference_no=updated_order.order_number,
                        notes=f"Order {updated_order.order_number} cancelled by admin",
                        recorded_by=request.user
                    )

        AuditLog.objects.create(
            user=request.user,
            action="ORDER_UPDATE",
            target_model="Order",
            target_id=updated_order.order_number,
            details=request.data
        )

        return Response(OrderSerializer(updated_order).data)
