import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Building,
  Smartphone,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Address, DeliveryZone, PaymentMethodConfig } from '../types';
import { formatUGX } from '../utils/format';
import apiClient from '../api/client';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cart, subtotal, discount, appliedCoupon, refreshCart, removeCoupon } = useCart();
  const navigate = useNavigate();

  // Redirect if not signed in or cart is empty
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mtn_momo');

  // Address form fields
  const [recipientName, setRecipientName] = useState(user ? `${user.first_name} ${user.last_name}`.trim() : '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [recipientEmail, setRecipientEmail] = useState(user?.email || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [divisionOrArea, setDivisionOrArea] = useState('');
  const [city, setCity] = useState('Kampala');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [saveThisAddress, setSaveThisAddress] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Fetch initial checkout data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [addrRes, zonesRes, methodsRes] = await Promise.all([
          apiClient.get<Address[]>('/addresses/'),
          apiClient.get<DeliveryZone[]>('/delivery-zones/'),
          apiClient.get<PaymentMethodConfig[]>('/payments/methods/'),
        ]);

        setSavedAddresses(addrRes.data);
        if (addrRes.data.length > 0) {
          const defaultAddr = addrRes.data.find((a) => a.is_default) || addrRes.data[0];
          setSelectedAddressId(defaultAddr.id);
          setRecipientName(defaultAddr.full_name);
          setRecipientPhone(defaultAddr.phone_number);
          setStreetAddress(defaultAddr.street_address);
          setDivisionOrArea(defaultAddr.division_or_area);
          setCity(defaultAddr.city);
          setDeliveryInstructions(defaultAddr.delivery_instructions || '');
        }

        setDeliveryZones(zonesRes.data);
        if (zonesRes.data.length > 0) {
          setSelectedZoneId(zonesRes.data[0].id);
        }

        setPaymentMethods(methodsRes.data);
        if (methodsRes.data.length > 0) {
          setSelectedPaymentMethod(methodsRes.data[0].method_type);
        }
      } catch (err) {
        console.error('Failed to load checkout options', err);
      }
    };

    fetchData();
  }, []);

  const handleSelectAddress = (id: number | 'new') => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setStreetAddress('');
      setDivisionOrArea('');
      setDeliveryInstructions('');
    } else {
      const addr = savedAddresses.find((a) => a.id === id);
      if (addr) {
        setRecipientName(addr.full_name);
        setRecipientPhone(addr.phone_number);
        setStreetAddress(addr.street_address);
        setDivisionOrArea(addr.division_or_area);
        setCity(addr.city);
        setDeliveryInstructions(addr.delivery_instructions || '');
      }
    }
  };

  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);

  // Delivery fee calculation
  let deliveryFee = 0;
  if (selectedZone && deliveryType === 'delivery') {
    const feeNum = parseFloat(selectedZone.delivery_fee);
    const threshold = selectedZone.free_delivery_threshold ? parseFloat(selectedZone.free_delivery_threshold) : null;
    if (threshold && subtotal >= threshold) {
      deliveryFee = 0;
    } else {
      deliveryFee = feeNum;
    }
  }

  const grandTotal = Math.max(0, (subtotal - discount) + deliveryFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneId) {
      setCheckoutError('Please select a delivery zone or pickup option.');
      return;
    }
    if (!recipientName.trim() || !recipientPhone.trim() || !streetAddress.trim() || !divisionOrArea.trim()) {
      setCheckoutError('Please complete all required delivery address fields.');
      return;
    }

    setSubmitting(true);
    setCheckoutError('');

    try {
      // If customer requested saving the address
      if (selectedAddressId === 'new' && saveThisAddress) {
        try {
          await apiClient.post('/addresses/', {
            full_name: recipientName,
            phone_number: recipientPhone,
            street_address: streetAddress,
            division_or_area: divisionOrArea,
            city,
            delivery_instructions: deliveryInstructions,
            is_default: savedAddresses.length === 0,
          });
        } catch {
          // Non-critical address save failure
        }
      }

      // Create Order via atomic backend endpoint
      const payload = {
        delivery_zone_id: selectedZoneId,
        delivery_type: deliveryType,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_email: recipientEmail,
        street_address: streetAddress,
        division_or_area: divisionOrArea,
        city,
        delivery_instructions: deliveryInstructions,
        payment_method: selectedPaymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : '',
      };

      const res = await apiClient.post('/orders/create/', payload);
      const createdOrder = res.data;

      // Clean up cart state
      removeCoupon();
      await refreshCart();

      // Navigate to confirmation page
      navigate(`/order-confirmation/${createdOrder.order_number}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Could not complete your order. Please check item availability.';
      setCheckoutError(msg);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Your basket is empty</h2>
        <p className="text-xs text-slate-500 mt-2">Add groceries to your basket before checkout.</p>
        <Link to="/shop" className="mt-5 inline-block px-6 py-2.5 bg-[#E15712] text-white text-xs font-bold rounded-full">
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Supermarket Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your delivery details and choose your preferred Uganda payment method
        </p>
      </div>

      {checkoutError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Steps */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* STEP 1: DELIVERY ADDRESS & CONTACT */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#E15712] font-black text-sm flex items-center justify-center">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Delivery Address & Recipient</h2>
                <p className="text-xs text-slate-500">Where should Mama Shopping Center deliver your groceries?</p>
              </div>
            </div>

            {/* Saved Addresses list if any */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Choose a saved address:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all text-xs ${
                        selectedAddressId === addr.id
                          ? 'border-[#E15712] bg-orange-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{addr.full_name}</div>
                      <div className="text-slate-600 mt-0.5">{addr.street_address}, {addr.division_or_area}</div>
                      <div className="text-slate-500 text-[11px] mt-1">{addr.phone_number}</div>
                    </div>
                  ))}
                  <div
                    onClick={() => handleSelectAddress('new')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all text-xs flex items-center justify-center text-center font-bold ${
                      selectedAddressId === 'new'
                        ? 'border-[#E15712] bg-orange-50/40 text-[#E15712]'
                        : 'border-dashed border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    + Enter New Address
                  </div>
                </div>
              </div>
            )}

            {/* Address Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grace Nakato"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Phone Number (For MoMo & Delivery) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +256 772 000 000"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / House / Building *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 14 Acacia Avenue, Flat 3B"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Division / Area *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kololo, Nakawa, Ntinda, Muyenga, Kira"
                  value={divisionOrArea}
                  onChange={(e) => setDivisionOrArea(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / District</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Directions / Landmark (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Black gate opposite shell petrol station, call upon arrival"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>
            </div>

            {selectedAddressId === 'new' && (
              <label className="flex items-center gap-2 text-xs text-slate-600 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveThisAddress}
                  onChange={(e) => setSaveThisAddress(e.target.checked)}
                  className="rounded text-[#E15712]"
                />
                <span>Save this address to my profile for future orders</span>
              </label>
            )}
          </section>

          {/* STEP 2: DELIVERY ZONE & METHOD */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2FA0E1] font-black text-sm flex items-center justify-center">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Delivery Zone & Service</h2>
                <p className="text-xs text-slate-500">Select your area in Kampala or in-store pickup</p>
              </div>
            </div>

            <div className="space-y-3">
              {deliveryZones.map((zone) => {
                const feeNum = parseFloat(zone.delivery_fee);
                const isFree = zone.free_delivery_threshold && subtotal >= parseFloat(zone.free_delivery_threshold);
                const isSelected = selectedZoneId === zone.id;

                return (
                  <div
                    key={zone.id}
                    onClick={() => {
                      setSelectedZoneId(zone.id);
                      setDeliveryType(zone.is_pickup ? 'pickup' : 'delivery');
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-[#2FA0E1] bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#2FA0E1] text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {zone.is_pickup ? <Building className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">{zone.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {zone.estimated_delivery_time}
                          </span>
                          {zone.free_delivery_threshold && (
                            <span className="text-emerald-700 font-medium">
                              (Free above {formatUGX(zone.free_delivery_threshold)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {zone.is_pickup || isFree ? (
                          <span className="text-emerald-600 font-bold">FREE</span>
                        ) : (
                          formatUGX(feeNum)
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 3: PAYMENT METHOD */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-black text-sm flex items-center justify-center">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Uganda Payment Method</h2>
                <p className="text-xs text-slate-500">Pay securely via Mobile Money, Bank Deposit, or Cash</p>
              </div>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((pm) => {
                const isSelected = selectedPaymentMethod === pm.method_type;
                return (
                  <div
                    key={pm.id}
                    onClick={() => setSelectedPaymentMethod(pm.method_type)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#E15712] bg-orange-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          pm.method_type === 'mtn_momo'
                            ? 'bg-yellow-400 text-slate-900'
                            : pm.method_type === 'airtel_money'
                            ? 'bg-red-500 text-white'
                            : pm.method_type === 'bank_transfer'
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">{pm.display_name}</div>
                          {pm.account_number_or_merchant_code && (
                            <div className="text-[11px] text-slate-500">
                              Merchant / Account: <strong>{pm.account_number_or_merchant_code}</strong> ({pm.account_name})
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#E15712] bg-[#E15712]' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Show instructions when selected */}
                    {isSelected && pm.instructions && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200/60 text-xs text-slate-600 bg-white/70 p-3 rounded-xl whitespace-pre-line leading-relaxed font-mono">
                        {pm.instructions}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right Column: Order Review & Confirmation */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Review & Place Order
            </h3>

            {/* Items summary preview */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-semibold text-slate-900 truncate">{item.product.name}</div>
                    <div className="text-[11px] text-slate-400">{item.quantity} x {formatUGX(item.unit_price)}</div>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">{formatUGX(item.line_total)}</span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatUGX(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-{formatUGX(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-bold text-slate-900">
                  {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : formatUGX(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Grand Total Payable</span>
                <span className="text-[#E15712]">{formatUGX(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#E15712] hover:bg-[#c4470a] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span>Placing Real Supermarket Order...</span>
              ) : (
                <>
                  <span>Confirm & Complete Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center space-y-1">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected atomic checkout. Stock reserved instantly.</span>
              </p>
              <p className="text-[10px] text-slate-400">
                You will receive an order confirmation and reference number immediately.
              </p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
