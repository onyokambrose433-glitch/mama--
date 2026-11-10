import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Printer,
  Truck,
  ArrowRight,
  Clock,
  Phone,
  MapPin,
  Smartphone,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { Order } from '../types';
import { formatUGX, formatDateTime } from '../utils/format';
import apiClient from '../api/client';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get<Order>(`/orders/${orderNumber}/`);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#E15712] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-semibold">Generating your order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">Could not retrieve order details for #{orderNumber}.</p>
        <Link to="/" className="mt-5 inline-block px-6 py-2.5 bg-[#E15712] text-white text-xs font-bold rounded-full">
          Return to Supermarket
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner Celebration */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Order Successfully Placed
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Thank you for shopping with Mama!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Your order has been recorded in our central system. Our fulfillment team is assembling your grocery basket.
        </p>

        <div className="pt-2 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-2xl text-xs sm:text-sm">
          <span className="text-slate-600 font-medium">Order Reference:</span>
          <strong className="font-mono text-[#E15712] font-black">{order.order_number}</strong>
        </div>
      </div>

      {/* Visual Order Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Order Progress Timeline</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {[
            { label: 'Order Placed', active: true },
            { label: 'Payment Verified', active: order.payment_status === 'paid' },
            { label: 'Packed & Ready', active: ['packed', 'ready_for_pickup', 'out_for_delivery', 'delivered'].includes(order.status) },
            { label: 'Out for Delivery', active: ['out_for_delivery', 'delivered'].includes(order.status) },
            { label: 'Delivered', active: order.status === 'delivered' }
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                step.active ? 'bg-[#E15712] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-[11px] font-semibold leading-tight ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Instructions if Unpaid */}
      {order.payment_status !== 'paid' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-3xl space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
            <Smartphone className="w-5 h-5 text-[#E15712]" />
            <span>Payment Instructions ({order.payment_method_display})</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Please complete payment of <strong>{formatUGX(order.total_amount)}</strong> using reference <strong>{order.order_number}</strong>.
            {order.payment_method === 'mtn_momo' && (
              <span> MoMoPay Merchant Code: <strong>592811</strong> (Mama Shopping Center). Dial *165*3#.</span>
            )}
            {order.payment_method === 'airtel_money' && (
              <span> Airtel Money Merchant Code: <strong>1204892</strong>. Dial *185*9#.</span>
            )}
            {order.payment_method === 'bank_transfer' && (
              <span> Stanbic Bank Uganda, Account: <strong>9030018492019</strong>, Mama Shopping Center Ltd.</span>
            )}
            {order.payment_method === 'cash_on_delivery' && (
              <span> Please have the exact cash amount ready for our delivery rider upon package arrival.</span>
            )}
          </p>
        </div>
      )}

      {/* Order Details & Items Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Recipient & Zone Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Delivery Details</span>
            <div className="font-bold text-sm text-slate-900">{order.recipient_name}</div>
            <div className="text-slate-600">{order.street_address}, {order.division_or_area}, {order.city}</div>
            <div className="text-slate-500">{order.recipient_phone}</div>
            {order.delivery_instructions && (
              <div className="text-slate-500 italic mt-1">Directions: {order.delivery_instructions}</div>
            )}
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Order Information</span>
            <div className="text-slate-600">Date: {formatDateTime(order.created_at)}</div>
            <div className="text-slate-600">Method: {order.delivery_type === 'pickup' ? 'In-Store Pickup' : 'Home Delivery'}</div>
            <div className="text-slate-600">Zone: {order.delivery_zone_name || 'Standard'}</div>
            <div className="mt-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Payment: {order.payment_status_display}
              </span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Items Ordered</h4>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.product_name}</div>
                  <div className="text-[11px] text-slate-500">{item.quantity} x {formatUGX(item.unit_price)} ({item.unit})</div>
                </div>
                <div className="font-black text-slate-900">{formatUGX(item.subtotal)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">{formatUGX(order.subtotal)}</span>
          </div>
          {parseFloat(order.discount_amount) > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span>-{formatUGX(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-bold text-slate-900">
              {parseFloat(order.delivery_fee) === 0 ? <span className="text-emerald-600">FREE</span> : formatUGX(order.delivery_fee)}
            </span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
            <span>Total Amount</span>
            <span className="text-[#E15712]">{formatUGX(order.total_amount)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt / Invoice</span>
          </button>

          <div className="flex items-center gap-3">
            <Link
              to="/account?tab=orders"
              className="px-5 py-2.5 bg-[#2FA0E1] hover:bg-[#2288c4] text-white text-xs font-bold rounded-xl transition-colors"
            >
              View in My Orders
            </Link>
            <Link
              to="/shop"
              className="px-5 py-2.5 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
