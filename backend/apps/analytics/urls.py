from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardStatsView, ProfitLossReportView, ExpenseViewSet, ExportReportExcelView

router = DefaultRouter()
router.register(r'admin/expenses', ExpenseViewSet, basename='admin_expenses')

urlpatterns = [
    path('admin/analytics/dashboard/', DashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('admin/analytics/profit-loss/', ProfitLossReportView.as_view(), name='admin_profit_loss'),
    path('admin/analytics/export/', ExportReportExcelView.as_view(), name='admin_export_report'),
    path('', include(router.urls)),
]
