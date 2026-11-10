from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from apps.accounts.permissions import IsAdminOrStaff
from apps.accounts.models import AuditLog
from apps.catalog.models import Product
from .models import StockMovement
from .serializers import (
    StockMovementSerializer, StockAdjustmentSerializer, InventoryProductOverviewSerializer
)

class InventoryOverviewView(generics.ListAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = InventoryProductOverviewSerializer

    def get_queryset(self):
        qs = Product.objects.all().select_related('category')
        status_filter = self.request.query_params.get('status')
        if status_filter == 'low':
            qs = qs.filter(stock_quantity__gt=0, stock_quantity__lte=F('low_stock_threshold'))
        elif status_filter == 'out':
            qs = qs.filter(stock_quantity__lte=0)
        elif status_filter == 'in':
            qs = qs.filter(stock_quantity__gt=F('low_stock_threshold'))

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(sku__icontains=search)

        return qs.order_by('stock_quantity', 'name')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Compute aggregate valuation across all products
        total_products = Product.objects.count()
        low_stock_count = Product.objects.filter(stock_quantity__gt=0, stock_quantity__lte=F('low_stock_threshold')).count()
        out_of_stock_count = Product.objects.filter(stock_quantity__lte=0).count()

        # Valuation
        cost_val = Product.objects.filter(stock_quantity__gt=0).aggregate(
            total=Sum(ExpressionWrapper(F('stock_quantity') * F('cost_price'), output_field=DecimalField()))
        )['total'] or 0

        retail_val = Product.objects.filter(stock_quantity__gt=0).aggregate(
            total=Sum(ExpressionWrapper(F('stock_quantity') * F('selling_price'), output_field=DecimalField()))
        )['total'] or 0

        summary = {
            "total_products": total_products,
            "low_stock_count": low_stock_count,
            "out_of_stock_count": out_of_stock_count,
            "total_cost_valuation": float(cost_val),
            "total_retail_valuation": float(retail_val),
            "potential_margin": float(retail_val - cost_val)
        }

        return Response({
            "summary": summary,
            "results": response.data
        })


class StockAdjustmentView(APIView):
    permission_classes = [IsAdminOrStaff]

    @transaction.atomic
    def post(self, request):
        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            product = Product.objects.select_for_update().get(id=data['product_id'])
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        movement_type = data['movement_type']
        raw_qty = data['quantity']
        previous_stock = product.stock_quantity

        # Interpret direction based on movement type
        # stock_in, return: addition
        # stock_out, sale, damaged, expired: subtraction
        # adjustment: can be directly signed or absolute
        if movement_type in [StockMovement.MovementType.STOCK_IN, StockMovement.MovementType.RETURN]:
            delta = abs(raw_qty)
        elif movement_type in [StockMovement.MovementType.STOCK_OUT, StockMovement.MovementType.DAMAGED, StockMovement.MovementType.EXPIRED]:
            delta = -abs(raw_qty)
        else: # adjustment
            delta = raw_qty

        new_stock = previous_stock + delta
        if new_stock < 0:
            return Response(
                {"detail": f"Stock adjustment would result in negative inventory ({new_stock}). Available stock is {previous_stock}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        product.stock_quantity = new_stock
        unit_cost = data.get('unit_cost') or product.cost_price
        if movement_type == StockMovement.MovementType.STOCK_IN and data.get('unit_cost') and data['unit_cost'] > 0:
            product.cost_price = data['unit_cost']
        product.save()

        movement = StockMovement.objects.create(
            product=product,
            movement_type=movement_type,
            quantity=delta,
            previous_stock=previous_stock,
            new_stock=new_stock,
            unit_cost=unit_cost,
            reference_no=data.get('reference_no', ''),
            batch_no=data.get('batch_no', ''),
            expiry_date=data.get('expiry_date'),
            notes=data.get('notes', ''),
            recorded_by=request.user
        )

        AuditLog.objects.create(
            user=request.user,
            action=f"STOCK_{movement_type.upper()}",
            target_model="Product",
            target_id=str(product.id),
            details={
                "product_name": product.name,
                "delta": delta,
                "previous_stock": previous_stock,
                "new_stock": new_stock,
                "notes": data.get('notes', '')
            }
        )

        return Response(StockMovementSerializer(movement).data, status=status.HTTP_201_CREATED)


class StockMovementListView(generics.ListAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = StockMovementSerializer

    def get_queryset(self):
        qs = StockMovement.objects.all().select_related('product', 'recorded_by')
        product_id = self.request.query_params.get('product_id')
        if product_id:
            qs = qs.filter(product_id=product_id)

        movement_type = self.request.query_params.get('movement_type')
        if movement_type:
            qs = qs.filter(movement_type=movement_type)

        return qs.order_by('-created_at')
