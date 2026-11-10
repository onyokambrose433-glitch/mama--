import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  ClipboardList,
  Users,
  FolderTree,
  Tag,
  Truck,
  CreditCard,
  Globe,
  FileSpreadsheet,
  ShieldAlert,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  Filter,
  Check,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, Category, Brand, Order, DeliveryZone, PaymentMethodConfig, Coupon, Expense } from '../types';
import { formatUGX, formatDateTime } from '../utils/format';
import apiClient from '../api/client';

export const AdminPortalPage: React.FC = () => {
  const { user, isStaff, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Guard: redirect non-staff
  useEffect(() => {
    if (!user || !isStaff) {
      navigate('/login?redirect=/admin-portal');
    }
  }, [user, isStaff, navigate]);

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'products'
    | 'inventory'
    | 'orders'
    | 'customers'
    | 'categories'
    | 'promotions'
    | 'delivery'
    | 'payments'
    | 'cms'
    | 'reports'
    | 'staff'
  >('overview');

  // Overview metrics state
  const [metrics, setMetrics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [dailySalesChart, setDailySalesChart] = useState<any[]>([]);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Inventory state
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [inventorySummary, setInventorySummary] = useState<any>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<any[]>([]);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Customers state
  const [customers, setCustomers] = useState<any[]>([]);

  // Categories & Brands
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Delivery Zones
  const [zones, setZones] = useState<DeliveryZone[]>([]);

  // Payments & Transactions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);

  // CMS Settings
  const [settings, setSettings] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);

  // Financial Reports
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Staff & Audit
  const [staffList, setStaffList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Loading indicator
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch data per tab
  useEffect(() => {
    if (!isStaff) return;

    const loadTabData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'overview') {
          const res = await apiClient.get('/admin/analytics/dashboard/');
          setMetrics(res.data.metrics);
          setRecentOrders(res.data.recent_orders || []);
          setDailySalesChart(res.data.daily_sales_chart || []);
        } else if (activeTab === 'products') {
          const [prodRes, catRes, brandRes] = await Promise.all([
            apiClient.get('/products/?admin=true'),
            apiClient.get('/categories/'),
            apiClient.get('/brands/'),
          ]);
          const toArr = (d: any) => Array.isArray(d) ? d : (Array.isArray(d?.results) ? d.results : []);
          setProducts(toArr(prodRes.data));
          setCategories(toArr(catRes.data));
          setBrands(toArr(brandRes.data));
        } else if (activeTab === 'inventory') {
          const [invRes, movRes] = await Promise.all([
            apiClient.get('/admin/inventory/'),
            apiClient.get('/admin/inventory/movements/'),
          ]);
          setInventoryList(invRes.data.results || (Array.isArray(invRes.data) ? invRes.data : []));
          setInventorySummary(invRes.data.summary || null);
          setMovements(movRes.data.results || (Array.isArray(movRes.data) ? movRes.data : []));
        } else if (activeTab === 'orders') {
          const res = await apiClient.get('/admin/orders/');
          setOrders(res.data.results || (Array.isArray(res.data) ? res.data : []));
        } else if (activeTab === 'customers') {
          const res = await apiClient.get('/admin/customers/');
          setCustomers(res.data.results || (Array.isArray(res.data) ? res.data : []));
        } else if (activeTab === 'categories') {
          const [catRes, brandRes] = await Promise.all([
            apiClient.get('/categories/'),
            apiClient.get('/brands/'),
          ]);
          const toArr = (d: any) => Array.isArray(d) ? d : (Array.isArray(d?.results) ? d.results : []);
          setCategories(toArr(catRes.data));
          setBrands(toArr(brandRes.data));
        } else if (activeTab === 'promotions') {
          const res = await apiClient.get('/admin/coupons/');
          setCoupons(res.data.results || (Array.isArray(res.data) ? res.data : []));
        } else if (activeTab === 'delivery') {
          const res = await apiClient.get('/delivery-zones/');
          setZones(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.results) ? res.data.results : []));
        } else if (activeTab === 'payments') {
          const [txnRes, methRes] = await Promise.all([
            apiClient.get('/admin/payments/transactions/'),
            apiClient.get('/payments/methods/'),
          ]);
          setTransactions(txnRes.data.results || (Array.isArray(txnRes.data) ? txnRes.data : []));
          setPaymentMethods(Array.isArray(methRes.data) ? methRes.data : (Array.isArray(methRes.data?.results) ? methRes.data.results : []));
        } else if (activeTab === 'cms') {
          const [setRes, banRes] = await Promise.all([
            apiClient.get('/website/settings/'),
            apiClient.get('/banners/'),
          ]);
          setSettings(setRes.data);
          setBanners(Array.isArray(banRes.data) ? banRes.data : (Array.isArray(banRes.data?.results) ? banRes.data.results : []));
        } else if (activeTab === 'reports') {
          const [plRes, expRes] = await Promise.all([
            apiClient.get('/admin/analytics/profit-loss/'),
            apiClient.get('/admin/expenses/'),
          ]);
          setProfitLoss(plRes.data);
          setExpenses(expRes.data.results || expRes.data);
        } else if (activeTab === 'staff') {
          if (isSuperAdmin) {
            const [stfRes, audRes] = await Promise.all([
              apiClient.get('/admin/staff/'),
              apiClient.get('/admin/audit-logs/'),
            ]);
            setStaffList(stfRes.data.results || stfRes.data);
            setAuditLogs(audRes.data.results || audRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load tab data', err);
      } finally {
        setLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, isStaff, isSuperAdmin]);

  if (!user || !isStaff) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Admin Top Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="shrink-0 group">
              <img
                src="/logo.png"
                alt="Mama Supermarket"
                className="w-10 h-10 rounded-xl bg-white p-0.5 object-contain shadow-xs group-hover:scale-105 transition-transform"
              />
            </Link>
            <div>
              <span className="font-black text-sm tracking-tight text-white block leading-none">
                MAMA SUPERMARKET
              </span>
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                Management Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block">{user.first_name} {user.last_name}</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">{user.role.replace('_', ' ')}</span>
            </div>
            <a
              href="/"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
            >
              Public Shop ↗
            </a>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: ShoppingBag },
            { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
            { id: 'orders', label: 'Orders & Deliveries', icon: ClipboardList },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'categories', label: 'Categories & Brands', icon: FolderTree },
            { id: 'promotions', label: 'Coupons & Promos', icon: Tag },
            { id: 'delivery', label: 'Delivery Zones', icon: Truck },
            { id: 'payments', label: 'Payments & Transactions', icon: CreditCard },
            { id: 'cms', label: 'Website CMS', icon: Globe },
            { id: 'reports', label: 'Financial Profit & Loss', icon: FileSpreadsheet },
            ...(isSuperAdmin ? [{ id: 'staff', label: 'Staff & Roles', icon: ShieldAlert }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#E15712] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display Area */}
        <div className="flex-1">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Database Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Sales (UGX)</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {formatUGX(metrics?.total_sales || 0)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                    Today: {formatUGX(metrics?.today_sales || 0)}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {metrics?.total_orders || 0}
                  </div>
                  <span className="text-[10px] text-orange-600 font-bold mt-1 block">
                    {metrics?.pending_orders || 0} Pending Confirmation
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Registered Customers</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {metrics?.registered_customers || 0}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    Active client accounts
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Alerts</span>
                  <div className="text-xl sm:text-2xl font-black text-[#FF550D] mt-1">
                    {metrics?.low_stock_count || 0}
                  </div>
                  <span className="text-[10px] text-red-600 font-bold mt-1 block">
                    {metrics?.out_of_stock_count || 0} Out of Stock
                  </span>
                </div>
              </div>

              {/* Sales Chart & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 14 Days Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Daily Sales Trend (Last 14 Days in UGX)
                  </h3>
                  <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-slate-100">
                    {dailySalesChart && dailySalesChart.length > 0 ? (
                      dailySalesChart.map((d, i) => {
                        const maxSale = Math.max(...dailySalesChart.map((x) => x.sales), 100000);
                        const pct = Math.max(10, Math.round((d.sales / maxSale) * 100));
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                            <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              {d.orders} ord
                            </span>
                            <div
                              style={{ height: `${pct}%` }}
                              className="w-full bg-[#E15712] rounded-t-md hover:bg-[#FF550D] transition-colors"
                              title={`${d.date}: ${formatUGX(d.sales)} (${d.orders} orders)`}
                            />
                            <span className="text-[9px] text-slate-400 truncate w-full text-center">
                              {d.date}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full text-center text-slate-400 text-xs">No transaction history yet.</div>
                    )}
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Recent Orders
                    </h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-[#2FA0E1] font-bold hover:underline">
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {recentOrders.map((ro) => (
                      <div key={ro.id} className="py-2.5 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{ro.order_number}</div>
                          <div className="text-[11px] text-slate-500">{ro.recipient_name} • {ro.created_at}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-[#E15712]">{formatUGX(ro.total_amount)}</div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-[#E15712] font-semibold">
                            {ro.status_display}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Product Catalog Management</h2>
                  <p className="text-xs text-slate-500">Manage supermarket prices in UGX, cost prices, stock, and images</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }}
                  className="px-4 py-2 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">SKU</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-right">Cost Price</th>
                      <th className="py-3 px-3 text-right">Selling Price</th>
                      <th className="py-3 px-3 text-center">Stock</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {p.primary_image_url ? (
                              <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">{p.sku}</td>
                        <td className="py-3 px-3 text-slate-600">{p.category_name}</td>
                        <td className="py-3 px-3 text-right text-slate-500">{formatUGX(p.cost_price)}</td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">{formatUGX(p.current_price)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.stock_quantity <= 0
                              ? 'bg-red-100 text-red-700'
                              : p.stock_quantity <= p.low_stock_threshold
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.stock_quantity} {p.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {p.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setShowProductModal(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-[#2FA0E1] hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Delete "${p.name}"?`)) {
                                  await apiClient.delete(`/products/${p.slug}/`);
                                  setProducts(products.filter((item) => item.id !== p.id));
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add / Edit Product Modal */}
              {showProductModal && (
                <ProductModal
                  product={editingProduct}
                  categories={categories}
                  brands={brands}
                  onClose={() => setShowProductModal(false)}
                  onSaved={async () => {
                    setShowProductModal(false);
                    const res = await apiClient.get('/products/?admin=true');
                    setProducts(res.data.results || res.data);
                  }}
                />
              )}

            </div>
          )}

          {/* TAB 3: INVENTORY & STOCK */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              
              {/* Valuation Summary Card */}
              {inventorySummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Total Cost Valuation</span>
                    <div className="text-xl font-black text-slate-900 mt-1">
                      {formatUGX(inventorySummary.total_cost_valuation)}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Total Retail Valuation</span>
                    <div className="text-xl font-black text-[#E15712] mt-1">
                      {formatUGX(inventorySummary.total_retail_valuation)}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Estimated Gross Margin</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">
                      {formatUGX(inventorySummary.potential_margin)}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Alerted Items</span>
                    <div className="text-xl font-black text-red-600 mt-1">
                      {inventorySummary.low_stock_count + inventorySummary.out_of_stock_count}
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Table */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Inventory Levels & Stock Take</h3>
                  <span className="text-xs text-slate-500">Record stock-ins, damaged items, or physical count audits</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Product</th>
                        <th className="py-3 px-3">SKU</th>
                        <th className="py-3 px-3 text-right">Cost Price</th>
                        <th className="py-3 px-3 text-right">Selling Price</th>
                        <th className="py-3 px-3 text-center">Stock Quantity</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-right">Adjust Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventoryList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-bold text-slate-900">{item.name}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{item.sku}</td>
                          <td className="py-3 px-3 text-right text-slate-600">{formatUGX(item.cost_price)}</td>
                          <td className="py-3 px-3 text-right font-black text-slate-900">{formatUGX(item.selling_price)}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900">{item.stock_quantity} {item.unit}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              item.stock_status === 'OUT_OF_STOCK'
                                ? 'bg-red-100 text-red-700'
                                : item.stock_status === 'LOW_STOCK'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {item.stock_status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setStockProduct(item);
                                setShowStockModal(true);
                              }}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                            >
                              Stock Action
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Movement Audit History */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Recent Stock Movement Audit Ledger
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">Movement Type</th>
                        <th className="py-2.5 px-3 text-center">Quantity Delta</th>
                        <th className="py-2.5 px-3 text-center">New Stock</th>
                        <th className="py-2.5 px-3">Reference / Notes</th>
                        <th className="py-2.5 px-3">Staff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {movements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 text-slate-500">{formatDateTime(m.created_at)}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{m.product_name}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-700">{m.movement_type_display}</td>
                          <td className="py-2.5 px-3 text-center font-black">
                            <span className={m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}>
                              {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-700">{m.new_stock}</td>
                          <td className="py-2.5 px-3 text-slate-500">{m.reference_no} {m.notes}</td>
                          <td className="py-2.5 px-3 text-slate-600">{m.recorded_by_name || 'System'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Adjustment Modal */}
              {showStockModal && stockProduct && (
                <StockAdjustmentModal
                  product={stockProduct}
                  onClose={() => setShowStockModal(false)}
                  onSaved={async () => {
                    setShowStockModal(false);
                    const [invRes, movRes] = await Promise.all([
                      apiClient.get('/admin/inventory/'),
                      apiClient.get('/admin/inventory/movements/'),
                    ]);
                    setInventoryList(invRes.data.results || []);
                    setInventorySummary(invRes.data.summary || null);
                    setMovements(movRes.data.results || movRes.data);
                  }}
                />
              )}

            </div>
          )}

          {/* TAB 4: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Supermarket Orders & Fulfillment</h2>
                  <p className="text-xs text-slate-500">Update order status, verify payment, assign delivery couriers, print invoices</p>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Order Number</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Zone / Address</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Payment</th>
                      <th className="py-3 px-3 text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{o.order_number}</td>
                        <td className="py-3 px-3 text-slate-500">{formatDateTime(o.created_at)}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{o.recipient_name}</div>
                          <div className="text-[11px] text-slate-500">{o.recipient_phone}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{o.division_or_area}, {o.city}</td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">{formatUGX(o.total_amount)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            o.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-[#E15712]'
                          }`}>
                            {o.status_display}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            o.payment_status === 'paid' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.payment_status_display}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                          >
                            Open Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Detail Drawer / Modal */}
              {selectedOrder && (
                <AdminOrderDetailModal
                  order={selectedOrder}
                  onClose={() => setSelectedOrder(null)}
                  onUpdated={async () => {
                    const res = await apiClient.get('/admin/orders/');
                    setOrders(res.data.results || res.data);
                    setSelectedOrder(null);
                  }}
                />
              )}

            </div>
          )}

          {/* TAB 5: CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-slate-900">Registered Customer Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Email Address</th>
                      <th className="py-3 px-3">Phone Number</th>
                      <th className="py-3 px-3">Date Joined</th>
                      <th className="py-3 px-3 text-center">Account Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-bold text-slate-900">{c.first_name} {c.last_name}</td>
                        <td className="py-3 px-3 text-slate-600">{c.email}</td>
                        <td className="py-3 px-3 text-slate-600">{c.phone || 'N/A'}</td>
                        <td className="py-3 px-3 text-slate-400">{formatDateTime(c.date_joined)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                          }`}>
                            {c.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={async () => {
                              await apiClient.post(`/admin/customers/${c.id}/toggle-status/`);
                              const res = await apiClient.get('/admin/customers/');
                              setCustomers(res.data.results || res.data);
                            }}
                            className="px-3 py-1 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                          >
                            {c.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CATEGORIES & BRANDS */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Categories */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Categories ({categories.length})</h3>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {categories.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="text-[11px] text-slate-400 block">{c.description}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 font-mono text-[10px]">
                        Order: {c.order}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Brands ({brands.length})</h3>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {brands.map((b) => (
                    <div key={b.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{b.name}</span>
                      <span className="text-[11px] text-slate-400">{b.slug}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: COUPONS & PROMOTIONS */}
          {activeTab === 'promotions' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-black text-slate-900">Coupon Codes & Campaigns</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Code</th>
                      <th className="py-3 px-3">Discount</th>
                      <th className="py-3 px-3 text-right">Min Order</th>
                      <th className="py-3 px-3 text-center">Usage</th>
                      <th className="py-3 px-3">Valid Until</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map((cp) => (
                      <tr key={cp.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{cp.code}</td>
                        <td className="py-3 px-3 font-semibold text-[#E15712]">
                          {cp.discount_type === 'percentage' ? `${cp.discount_value}%` : formatUGX(cp.discount_value)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600">{formatUGX(cp.min_purchase_amount)}</td>
                        <td className="py-3 px-3 text-center text-slate-700">{cp.times_used} / {cp.max_uses || '∞'}</td>
                        <td className="py-3 px-3 text-slate-500">{formatDateTime(cp.end_date)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            cp.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                          }`}>
                            {cp.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: DELIVERY ZONES */}
          {activeTab === 'delivery' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-black text-slate-900">Kampala Delivery Zones & Tariffs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Zone Name</th>
                      <th className="py-3 px-3 text-right">Delivery Fee</th>
                      <th className="py-3 px-3 text-right">Free Delivery Threshold</th>
                      <th className="py-3 px-3">Estimated Time</th>
                      <th className="py-3 px-3 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {zones.map((z) => (
                      <tr key={z.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-bold text-slate-900">{z.name}</td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">{formatUGX(z.delivery_fee)}</td>
                        <td className="py-3 px-3 text-right text-emerald-600 font-semibold">
                          {z.free_delivery_threshold ? formatUGX(z.free_delivery_threshold) : 'None'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{z.estimated_delivery_time}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                            {z.is_pickup ? 'In-Store Pickup' : 'Courier Dispatch'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: PAYMENTS & TRANSACTIONS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              
              {/* Payment Methods Status */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Payment Channels (Uganda Mobile Money & Banks)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{pm.display_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pm.is_enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                        }`}>
                          {pm.is_enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      {pm.account_number_or_merchant_code && (
                        <p className="text-[11px] text-slate-500 font-mono">Code: {pm.account_number_or_merchant_code}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Log */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Transaction Records & Verifications
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Reference</th>
                        <th className="py-3 px-3">Order</th>
                        <th className="py-3 px-3">Channel</th>
                        <th className="py-3 px-3 text-right">Amount</th>
                        <th className="py-3 px-3">Customer Phone</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{tx.transaction_reference}</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{tx.order_number}</td>
                          <td className="py-3 px-3 font-semibold uppercase text-slate-700">{tx.payment_method}</td>
                          <td className="py-3 px-3 text-right font-black text-slate-900">{formatUGX(tx.amount)}</td>
                          <td className="py-3 px-3 text-slate-500">{tx.phone_number}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              tx.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {tx.status_display}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {tx.status !== 'success' && (
                              <button
                                onClick={async () => {
                                  await apiClient.post(`/admin/payments/transactions/${tx.id}/verify/`, {
                                    external_reference: 'MANUAL_VERIFIED'
                                  });
                                  const res = await apiClient.get('/admin/payments/transactions/');
                                  setTransactions(res.data.results || res.data);
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                              >
                                Verify Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 10: WEBSITE CMS */}
          {activeTab === 'cms' && settings && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 max-w-3xl">
              <h2 className="text-lg font-black text-slate-900">Website Content & Branding CMS</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await apiClient.patch('/website/settings/', settings);
                  alert('Website settings updated successfully! Public pages updated dynamically.');
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold mb-1">Supermarket Name</label>
                  <input
                    type="text"
                    value={settings.supermarket_name}
                    onChange={(e) => setSettings({ ...settings, supermarket_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Announcement Bar Text</label>
                  <input
                    type="text"
                    value={settings.announcement_text}
                    onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Phone Contact</label>
                    <input
                      type="text"
                      value={settings.primary_phone}
                      onChange={(e) => setSettings({ ...settings, primary_phone: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={settings.primary_email}
                      onChange={(e) => setSettings({ ...settings, primary_email: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Store Physical Address</label>
                  <input
                    type="text"
                    value={settings.physical_address}
                    onChange={(e) => setSettings({ ...settings, physical_address: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">About Us Content</label>
                  <textarea
                    rows={4}
                    value={settings.about_us}
                    onChange={(e) => setSettings({ ...settings, about_us: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E15712] hover:bg-[#c4470a] text-white font-bold rounded-xl"
                >
                  Save CMS Branding Updates
                </button>
              </form>
            </div>
          )}

          {/* TAB 11: FINANCIAL PROFIT & LOSS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              
              {/* Financial Profit Summary */}
              {profitLoss && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Financial Profit & Loss Statement</h2>
                      <p className="text-xs text-slate-500">Calculated from actual product costs (COGS) and recorded store expenses</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="/api/admin/analytics/export/?type=sales"
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Excel</span>
                      </a>
                      <button
                        onClick={() => setShowExpenseModal(true)}
                        className="px-4 py-2 bg-[#E15712] text-white text-xs font-bold rounded-xl hover:bg-[#c4470a] transition-colors"
                      >
                        + Log Expense
                      </button>
                    </div>
                  </div>

                  {/* Calculations Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Total Gross Sales</span>
                      <div className="text-xl font-black text-slate-900 mt-1">
                        {formatUGX(profitLoss.financial_summary?.total_revenue)}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Cost of Goods Sold (COGS)</span>
                      <div className="text-xl font-black text-slate-600 mt-1">
                        {formatUGX(profitLoss.financial_summary?.cost_of_goods_sold)}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                      <span className="text-[11px] font-bold uppercase text-[#E15712]">Gross Profit</span>
                      <div className="text-xl font-black text-[#E15712] mt-1">
                        {formatUGX(profitLoss.financial_summary?.gross_profit)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {profitLoss.financial_summary?.gross_margin_pct}% margin
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[11px] font-bold uppercase text-emerald-700">Real Net Profit</span>
                      <div className="text-xl font-black text-emerald-700 mt-1">
                        {formatUGX(profitLoss.financial_summary?.net_profit)}
                      </div>
                      <span className="text-[10px] text-emerald-800 font-bold">
                        After {formatUGX(profitLoss.financial_summary?.total_operating_expenses)} expenses
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Expenses Log */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Recorded Operating Expenses
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Title / Description</th>
                        <th className="py-2.5 px-3 text-right">Amount (UGX)</th>
                        <th className="py-2.5 px-3">Receipt Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 text-slate-500">{e.expense_date}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-700">{e.category_display}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{e.title}</td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900">{formatUGX(e.amount)}</td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono">{e.receipt_reference || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Log Expense Modal */}
              {showExpenseModal && (
                <LogExpenseModal
                  onClose={() => setShowExpenseModal(false)}
                  onSaved={async () => {
                    setShowExpenseModal(false);
                    const [plRes, expRes] = await Promise.all([
                      apiClient.get('/admin/analytics/profit-loss/'),
                      apiClient.get('/admin/expenses/'),
                    ]);
                    setProfitLoss(plRes.data);
                    setExpenses(expRes.data.results || expRes.data);
                  }}
                />
              )}

            </div>
          )}

          {/* TAB 12: STAFF MANAGEMENT (SUPER ADMIN ONLY) */}
          {activeTab === 'staff' && isSuperAdmin && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-black text-slate-900">Staff Accounts & Role-Based Permissions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Staff Name</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-bold text-slate-900">{st.first_name} {st.last_name}</td>
                        <td className="py-3 px-3 text-slate-600">{st.email}</td>
                        <td className="py-3 px-3 font-bold uppercase text-[#E15712]">{st.role?.replace('_', ' ')}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

// ==========================================
// SUB-MODALS FOR ADMIN OPERATIONS
// ==========================================

// 1. Product Modal
const ProductModal: React.FC<{
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ product, categories, brands, onClose, onSaved }) => {
  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [category, setCategory] = useState(product?.category || (categories[0]?.id || 1));
  const [brand, setBrand] = useState(product?.brand || '');
  const [description, setDescription] = useState(product?.description || '');
  const [costPrice, setCostPrice] = useState(product?.cost_price || '0');
  const [sellingPrice, setSellingPrice] = useState(product?.selling_price || '0');
  const [discountPrice, setDiscountPrice] = useState(product?.discount_price || '');
  const [unit, setUnit] = useState(product?.unit || 'piece');
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity || 0);
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.low_stock_threshold || 5);
  const [imageUrl, setImageUrl] = useState(product?.primary_image_url || '');
  const [isFeatured, setIsFeatured] = useState(product?.is_featured || false);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller || false);
  const [isActive, setIsActive] = useState(product ? product.is_active : true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name,
      sku,
      category,
      brand: brand || null,
      description,
      cost_price: costPrice,
      selling_price: sellingPrice,
      discount_price: discountPrice ? discountPrice : null,
      unit,
      stock_quantity: stockQuantity,
      low_stock_threshold: lowStockThreshold,
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      is_active: isActive,
    };

    try {
      let savedProduct;
      if (product) {
        const res = await apiClient.patch(`/products/${product.slug}/?admin=true`, payload);
        savedProduct = res.data;
      } else {
        const res = await apiClient.post('/products/?admin=true', payload);
        savedProduct = res.data;
      }

      // If image URL provided, attach as product image
      if (imageUrl) {
        await apiClient.post(`/products/${savedProduct.slug}/upload_image/`, {
          image_url: imageUrl,
          is_feature: true,
        });
      }

      onSaved();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not save product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
        <h3 className="text-base font-bold text-slate-900">
          {product ? `Edit Product: ${product.name}` : 'Add New Supermarket Product'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Stock Keeping Unit (SKU) *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              >
                <option value="">No Brand / Generic</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Cost Price (UGX)</label>
              <input
                type="number"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Selling Price (UGX) *</label>
              <input
                type="number"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Discount Price (UGX)</label>
              <input
                type="number"
                placeholder="Optional"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              >
                <option value="piece">Piece</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="litre">Litre (L)</option>
                <option value="ml">Millilitre (ml)</option>
                <option value="packet">Packet</option>
                <option value="carton">Carton</option>
                <option value="bottle">Bottle</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Stock Quantity</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Low Stock Alert</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Product Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-[#E15712]"
              />
              <span>Feature on Homepage</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="rounded text-[#E15712]"
              />
              <span>Mark as Bestseller</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-[#E15712]"
              />
              <span>Product Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#E15712] hover:bg-[#c4470a] text-white font-bold rounded-xl"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Stock Adjustment Modal
const StockAdjustmentModal: React.FC<{
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}> = ({ product, onClose, onSaved }) => {
  const [movementType, setMovementType] = useState('stock_in');
  const [quantity, setQuantity] = useState(10);
  const [unitCost, setUnitCost] = useState(product.cost_price || '0');
  const [referenceNo, setReferenceNo] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/admin/inventory/adjust/', {
        product_id: product.id,
        movement_type: movementType,
        quantity,
        unit_cost: unitCost,
        reference_no: referenceNo,
        batch_no: batchNo,
        notes,
      });
      onSaved();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Stock adjustment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Stock Adjustment: {product.name}
        </h3>
        <p className="text-xs text-slate-500">Current available stock: <strong>{product.stock_quantity} {product.unit}</strong></p>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Adjustment Type *</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            >
              <option value="stock_in">Stock In / Purchase Received (+)</option>
              <option value="stock_out">Stock Out / Dispatch (-)</option>
              <option value="damaged">Damaged Goods (-)</option>
              <option value="expired">Expired Goods (-)</option>
              <option value="adjustment">Physical Inventory Count Take</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Quantity *</label>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Unit Cost in UGX</label>
            <input
              type="number"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Reference Number (PO, Invoice, Count)</label>
            <input
              type="text"
              placeholder="e.g. PO-2026-99"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-[#E15712] text-white font-bold rounded-xl">
              {submitting ? 'Updating...' : 'Confirm Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Admin Order Detail Modal
const AdminOrderDetailModal: React.FC<{
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
}> = ({ order, onClose, onUpdated }) => {
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await apiClient.put(`/admin/orders/${order.order_number}/`, {
        status,
        payment_status: paymentStatus,
        comment,
      });
      onUpdated();
    } catch {
      alert('Could not update order status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage Order: {order.order_number}</h3>
            <span className="text-slate-500">Customer: {order.recipient_name} ({order.recipient_phone})</span>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold">
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>

        {/* Status updates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Fulfillment Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full p-2.5 border rounded-xl">
              <option value="pending">Pending Confirmation</option>
              <option value="confirmed">Order Confirmed</option>
              <option value="packed">Packed & Chilled</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered to Customer</option>
              <option value="cancelled">Cancelled (Restores Inventory)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Payment Status</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)} className="w-full p-2.5 border rounded-xl">
              <option value="unpaid">Unpaid</option>
              <option value="pending">Pending Verification</option>
              <option value="paid">Payment Verified</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-slate-700">Staff Note / Customer Notification</label>
          <input
            type="text"
            placeholder="e.g. Courier dispatched with insulated bag"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2.5 border rounded-xl"
          />
        </div>

        {/* Items List */}
        <div className="pt-2">
          <h4 className="font-bold text-slate-900 mb-2">Purchased Items:</h4>
          <div className="divide-y divide-slate-100">
            {order.items.map((it) => (
              <div key={it.id} className="py-2 flex justify-between">
                <span>{it.quantity}x {it.product_name} ({it.unit})</span>
                <span className="font-bold">{formatUGX(it.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 text-right font-black text-sm text-[#E15712]">
            Total: {formatUGX(order.total_amount)}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl">Close</button>
          <button type="button" onClick={handleUpdate} disabled={submitting} className="flex-1 py-2.5 bg-[#E15712] text-white font-bold rounded-xl">
            {submitting ? 'Updating...' : 'Save Order Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Log Expense Modal
const LogExpenseModal: React.FC<{
  onClose: () => void;
  onSaved: () => void;
}> = ({ onClose, onSaved }) => {
  const [category, setCategory] = useState('utilities');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptRef, setReceiptRef] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/expenses/', {
        category,
        title,
        amount,
        expense_date: expenseDate,
        receipt_reference: receiptRef,
        notes,
      });
      onSaved();
    } catch {
      alert('Could not record expense.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-xs">
        <h3 className="text-base font-bold text-slate-900">Record Operational Expense</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1">Expense Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border rounded-xl">
              <option value="utilities">Utilities (Electricity, Water, Internet)</option>
              <option value="rent">Store & Warehouse Rent</option>
              <option value="transport_fuel">Courier Fuel & Transport</option>
              <option value="packaging">Packaging Bags & Boxes</option>
              <option value="salaries">Staff Wages</option>
              <option value="supplies">Store Cleaning & Supplies</option>
              <option value="other">Other Miscellaneous</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Title / Expense Item *</label>
            <input type="text" required placeholder="e.g. UMEME Electricity Bill Oct" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 border rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Amount in UGX *</label>
            <input type="number" required placeholder="e.g. 250000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2.5 border rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Date *</label>
            <input type="date" required value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="w-full p-2.5 border rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Receipt / Voucher Number</label>
            <input type="text" value={receiptRef} onChange={(e) => setReceiptRef(e.target.value)} className="w-full p-2.5 border rounded-xl" />
          </div>
          <div className="flex gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-[#E15712] text-white font-bold rounded-xl">Log Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
};
