import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatUGX } from '../../utils/format';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isOpen,
    setIsOpen,
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

  if (!isOpen) return null;

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

  const handleCheckoutClick = () => {
    setIsOpen(false);
    if (user) {
      navigate('/checkout');
    } else {
      // Prompt customer to login/register to proceed with protected checkout
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#E15712] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Shopping Basket</h3>
                <p className="text-xs text-slate-500">
                  {cart?.total_items || 0} item{cart?.total_items === 1 ? '' : 's'} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
            {!cart || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E15712] mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Your basket is empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Browse through Mama Shopping Center's fresh groceries, bakery, butcher meats, and essentials.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/shop');
                  }}
                  className="mt-6 px-6 py-2.5 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs font-bold rounded-full transition-colors shadow-xs"
                >
                  Start Shopping Now
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="py-4 flex gap-3.5 first:pt-0 last:pb-0">
                  {/* Item Image */}
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {item.product.primary_image_url ? (
                      <img
                        src={item.product.primary_image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight line-clamp-2">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.product.sku} • {item.product.unit}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 text-slate-600 rounded-l-lg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="p-1 hover:bg-slate-200 text-slate-600 rounded-r-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line total in UGX */}
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-black text-[#E15712]">
                          {formatUGX(item.line_total)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatUGX(item.unit_price)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer & Checkout Action */}
          {cart && cart.items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
              
              {/* Coupon Box */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. MAMA10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-[#E15712] outline-hidden uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {couponError}
                </p>
              )}

              {/* Totals Summary */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatUGX(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Savings</span>
                    <span className="font-semibold">-{formatUGX(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charges</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Payable</span>
                  <span className="text-[#E15712]">{formatUGX(totalPayable)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 px-4 bg-[#E15712] hover:bg-[#c4470a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!user && (
                <p className="text-[11px] text-center text-slate-500">
                  🔒 You will be asked to sign in or register before completing your order.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
