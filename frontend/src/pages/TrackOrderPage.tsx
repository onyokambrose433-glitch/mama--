import React, { useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { formatUGX, formatDateTime } from '../utils/format';
import apiClient from '../api/client';

export const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await apiClient.get<Order>(`/orders/${orderNumber.trim()}/`);
      setOrder(res.data);
    } catch {
      setError(`No order found matching "${orderNumber.trim()}". Please double check your order reference.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E15712]">Live Delivery Dispatch</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Track Your Grocery Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your order reference code (e.g. MAMA-20261110-XXXXXX) provided upon confirmation.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="max-w-md mx-auto">
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1">
            <Package className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. MAMA-2026..."
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-2xl outline-hidden focus:border-[#E15712] font-mono uppercase shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Tracking...' : 'Track'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-slate-400 font-mono">Order Number</span>
              <h3 className="text-lg font-black text-slate-900">{order.order_number}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-[#E15712]">
                Status: {order.status_display}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Payment: {order.payment_status_display}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="py-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Delivery Timeline</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {[
                { label: 'Pending', active: true },
                { label: 'Confirmed', active: ['confirmed', 'packed', 'ready_for_pickup', 'out_for_delivery', 'delivered'].includes(order.status) },
                { label: 'Packed & Cold Chilled', active: ['packed', 'ready_for_pickup', 'out_for_delivery', 'delivered'].includes(order.status) },
                { label: 'Out for Delivery', active: ['out_for_delivery', 'delivered'].includes(order.status) },
                { label: 'Delivered', active: order.status === 'delivered' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                    step.active ? 'bg-[#E15712] text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[11px] font-semibold ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient & Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px]">Delivery To</span>
              <p className="font-bold text-slate-900 mt-0.5">{order.recipient_name}</p>
              <p className="text-slate-600">{order.street_address}, {order.division_or_area}</p>
              <p className="text-slate-500">{order.recipient_phone}</p>
            </div>
            <div className="sm:text-right">
              <span className="font-bold text-slate-400 uppercase text-[10px]">Order Total</span>
              <p className="text-lg font-black text-[#E15712] mt-0.5">{formatUGX(order.total_amount)}</p>
              <p className="text-slate-500">{order.items.length} item{order.items.length === 1 ? '' : 's'} included</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
