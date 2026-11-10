import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatUGX } from '../utils/format';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const totalPayable = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const handleProceedToCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-orange-50 border border-orange-100 text-[#E15712] flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 stroke-1" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Your Basket is Empty</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Explore Mama Shopping Center for fresh vegetables, butchery meats, dairy, bread, and everyday groceries in Kampala.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 px-7 py-3 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs font-bold rounded-full transition-colors shadow-md"
        >
          <span>Explore Supermarket Shelves</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Shopping Basket
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your items before proceeding to secure checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Products ({cart.total_items})
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Clear Entire Basket
              </button>
            </div>

            <div className="divide-y divide-slate-100 p-4 sm:p-6">
              {cart.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-18 h-18 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                      {item.product.primary_image_url ? (
                        <img
                          src={item.product.primary_image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="text-sm font-bold text-slate-900 hover:text-[#E15712] transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.product.category_name} • {item.product.unit}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 sm:hidden">
                        {formatUGX(item.unit_price)} each
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs text-slate-400">Unit Price</div>
                      <div className="text-xs font-semibold text-slate-700">{formatUGX(item.unit_price)}</div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-l-xl transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-black text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-r-xl transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <div className="text-sm font-black text-[#E15712]">
                        {formatUGX(item.line_total)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            {/* Coupon Code Section */}
            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatUGX(discount)})</span>
                </div>
                <button onClick={removeCoupon} className="text-xs text-red-600 hover:underline font-semibold">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl outline-hidden focus:border-[#E15712] uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {couponError}
                  </p>
                )}
              </form>
            )}

            {/* Calculations in UGX */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span className="font-bold text-slate-900">{formatUGX(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Savings</span>
                  <span className="font-bold">-{formatUGX(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Estimated Delivery</span>
                <span>Select zone at checkout</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Subtotal Payable</span>
                <span className="text-[#E15712]">{formatUGX(totalPayable)}</span>
              </div>
            </div>

            {/* Proceed to checkout button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-[#E15712] hover:bg-[#c4470a] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!user && (
              <p className="text-[11px] text-center text-slate-500">
                🔒 You will be asked to sign in or register to complete your order.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
