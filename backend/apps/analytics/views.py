import io
import csv
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, Count, F, ExpressionWrapper, DecimalField
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
import openpyxl

from apps.accounts.permissions import IsAdminOrStaff
from apps.accounts.models import CustomUser
from apps.catalog.models import Product
from apps.orders.models import Order, OrderItem
from .models import Expense
from .serializers import ExpenseSerializer

class DashboardStatsView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        now = timezone.now()
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Non-cancelled, non-refunded orders
        valid_orders = Order.objects.exclude(status__in=[Order.Status.CANCELLED, Order.Status.REFUNDED])

        total_sales = valid_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        today_sales = valid_orders.filter(created_at__gte=start_of_today).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        monthly_sales = valid_orders.filter(created_at__gte=start_of_month).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        total_orders_count = Order.objects.count()
        pending_orders_count = Order.objects.filter(status__in=[Order.Status.PENDING, Order.Status.AWAITING_PAYMENT, Order.Status.PROCESSING]).count()
        completed_orders_count = Order.objects.filter(status=Order.Status.DELIVERED).count()
        cancelled_orders_count = Order.objects.filter(status=Order.Status.CANCELLED).count()

        registered_customers_count = CustomUser.objects.filter(role=CustomUser.Role.CUSTOMER).count()
        total_products_count = Product.objects.count()
        low_stock_count = Product.objects.filter(stock_quantity__gt=0, stock_quantity__lte=F('low_stock_threshold')).count()
        out_of_stock_count = Product.objects.filter(stock_quantity__lte=0).count()

        # Recent 6 orders
        recent_orders = Order.objects.all().order_by('-created_at')[:6]
        recent_orders_data = [
            {
                "id": o.id,
                "order_number": o.order_number,
                "recipient_name": o.recipient_name,
                "recipient_phone": o.recipient_phone,
                "status": o.status,
                "status_display": o.get_status_display(),
                "payment_status": o.payment_status,
                "total_amount": float(o.total_amount),
                "created_at": o.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for o in recent_orders
        ]

        # Top 5 best selling products by quantity ordered
        top_items = OrderItem.objects.filter(order__in=valid_orders).values(
            'product__id', 'product_name', 'product_sku'
        ).annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('subtotal')
        ).order_by('-total_sold')[:5]

        # Sales chart for last 14 days
        daily_sales = []
        for i in range(13, -1, -1):
            day = (now - timedelta(days=i)).date()
            day_start = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time()))
            day_end = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.max.time()))
            
            day_rev = valid_orders.filter(created_at__range=(day_start, day_end)).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            day_orders = valid_orders.filter(created_at__range=(day_start, day_end)).count()
            daily_sales.append({
                "date": day.strftime("%b %d"),
                "sales": float(day_rev),
                "orders": day_orders
            })

        return Response({
            "metrics": {
                "total_sales": float(total_sales),
                "today_sales": float(today_sales),
                "monthly_sales": float(monthly_sales),
                "total_orders": total_orders_count,
                "pending_orders": pending_orders_count,
                "completed_orders": completed_orders_count,
                "cancelled_orders": cancelled_orders_count,
                "registered_customers": registered_customers_count,
                "total_products": total_products_count,
                "low_stock_count": low_stock_count,
                "out_of_stock_count": out_of_stock_count
            },
            "recent_orders": recent_orders_data,
            "top_products": list(top_items),
            "daily_sales_chart": daily_sales
        })


class ProfitLossReportView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        # Optional date range filtering
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        orders_qs = Order.objects.filter(status=Order.Status.DELIVERED)
        expenses_qs = Expense.objects.all()

        if start_date:
            orders_qs = orders_qs.filter(created_at__date__gte=start_date)
            expenses_qs = expenses_qs.filter(expense_date__gte=start_date)
        if end_date:
            orders_qs = orders_qs.filter(created_at__date__lte=end_date)
            expenses_qs = expenses_qs.filter(expense_date__lte=end_date)

        # Revenue
        total_revenue = orders_qs.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # Cost of Goods Sold (COGS)
        delivered_order_items = OrderItem.objects.filter(order__in=orders_qs)
        cogs = delivered_order_items.aggregate(
            total=Sum(ExpressionWrapper(F('unit_cost_price') * F('quantity'), output_field=DecimalField()))
        )['total'] or Decimal('0.00')

        gross_profit = total_revenue - cogs
        gross_margin_pct = (gross_profit / total_revenue * 100) if total_revenue > 0 else Decimal('0.00')

        # Total Operating Expenses
        total_expenses = expenses_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Net Profit
        net_profit = gross_profit - total_expenses
        net_margin_pct = (net_profit / total_revenue * 100) if total_revenue > 0 else Decimal('0.00')

        # Expenses categorized
        expenses_by_category = expenses_qs.values('category').annotate(
            total=Sum('amount'), count=Count('id')
        ).order_by('-total')

        category_labels = dict(Expense.Category.choices)
        categorized_list = [
            {
                "category": item['category'],
                "category_display": category_labels.get(item['category'], item['category']),
                "total": float(item['total']),
                "count": item['count']
            }
            for item in expenses_by_category
        ]

        return Response({
            "financial_summary": {
                "total_revenue": float(total_revenue),
                "cost_of_goods_sold": float(cogs),
                "gross_profit": float(gross_profit),
                "gross_margin_pct": round(float(gross_margin_pct), 2),
                "total_operating_expenses": float(total_expenses),
                "net_profit": float(net_profit),
                "net_margin_pct": round(float(net_margin_pct), 2),
                "currency": "UGX"
            },
            "expenses_breakdown": categorized_list
        })


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAdminOrStaff]
    queryset = Expense.objects.all().select_related('recorded_by')


class ExportReportExcelView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        report_type = request.query_params.get('type', 'sales')
        wb = openpyxl.Workbook()
        ws = wb.active

        if report_type == 'sales':
            ws.title = "Sales Report"
            ws.append(["Order Number", "Date", "Customer", "Phone", "Status", "Payment Method", "Subtotal (UGX)", "Delivery Fee (UGX)", "Total (UGX)"])
            orders = Order.objects.all().order_by('-created_at')
            for o in orders:
                ws.append([
                    o.order_number,
                    o.created_at.strftime("%Y-%m-%d %H:%M"),
                    o.recipient_name,
                    o.recipient_phone,
                    o.get_status_display(),
                    o.get_payment_method_display(),
                    float(o.subtotal),
                    float(o.delivery_fee),
                    float(o.total_amount)
                ])
        elif report_type == 'inventory':
            ws.title = "Inventory Valuation"
            ws.append(["SKU", "Product Name", "Category", "Unit", "Stock Qty", "Cost Price (UGX)", "Selling Price (UGX)", "Total Cost Valuation (UGX)", "Total Retail Valuation (UGX)"])
            products = Product.objects.all().select_related('category').order_by('name')
            for p in products:
                cost_val = float(p.cost_price * max(0, p.stock_quantity))
                retail_val = float(p.current_price * max(0, p.stock_quantity))
                ws.append([
                    p.sku,
                    p.name,
                    p.category.name if p.category else "",
                    p.get_unit_display(),
                    p.stock_quantity,
                    float(p.cost_price),
                    float(p.current_price),
                    cost_val,
                    retail_val
                ])
        else: # expenses
            ws.title = "Operating Expenses"
            ws.append(["Date", "Category", "Title", "Amount (UGX)", "Receipt Ref", "Notes"])
            expenses = Expense.objects.all().order_by('-expense_date')
            for e in expenses:
                ws.append([
                    str(e.expense_date),
                    e.get_category_display(),
                    e.title,
                    float(e.amount),
                    e.receipt_reference,
                    e.notes
                ])

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = f'attachment; filename=mama_report_{report_type}_{timezone.now():%Y%m%d}.xlsx'
        return response
