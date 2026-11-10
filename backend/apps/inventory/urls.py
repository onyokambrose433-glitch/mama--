from django.urls import path
from .views import InventoryOverviewView, StockAdjustmentView, StockMovementListView

urlpatterns = [
    path('admin/inventory/', InventoryOverviewView.as_view(), name='inventory_overview'),
    path('admin/inventory/adjust/', StockAdjustmentView.as_view(), name='inventory_adjust'),
    path('admin/inventory/movements/', StockMovementListView.as_view(), name='inventory_movements'),
]
