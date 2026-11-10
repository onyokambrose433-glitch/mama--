import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface Props {
  settings: WebsiteSettings | null;
}

export const Footer: React.FC<Props> = ({ settings }) => {
  const currentYear = new Date().getFullYear();
  const phone = settings?.primary_phone || '+256 700 892 100 / +256 772 892 100';
  const email = settings?.primary_email || 'orders@mamashoppingcenter.com';
  const address = settings?.physical_address || 'Plot 24, Kampala Road, Central Division, Kampala, Uganda';
  const hours = settings?.business_hours || 'Mon – Sun: 7:00 AM – 10:00 PM';

  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Feature Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-950/60 border border-orange-800/40 text-[#E15712] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Same-Day Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Orders delivered within 2-3 hours across Kampala divisions.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/40 text-[#2FA0E1] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">100% Fresh Guaranteed</h4>
              <p className="text-xs text-slate-400 mt-1">Single-owner supermarket with daily farm-inspected stock.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">MTN & Airtel MoMo</h4>
              <p className="text-xs text-slate-400 mt-1">Instant, secure mobile money payments & cash on delivery.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Direct Supermarket Stock</h4>
              <p className="text-xs text-slate-400 mt-1">Real inventory from our own shelves. No marketplace brokers.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-slate-800">
          
          {/* Brand & Store Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Mama Shopping Center Logo"
                className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow-sm"
              />
              <span className="text-xl font-black tracking-tight text-white">
                MAMA <span className="text-[#E15712]">SHOPPING</span> CENTER
              </span>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Mama Shopping Center is Kampala's premier neighborhood supermarket. We own, inspect, and fulfill every item directly from our central store to guarantee quality, hygiene, and authentic supermarket prices.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E15712] shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2FA0E1] shrink-0" />
                <span>{phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{hours}</span>
              </p>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Popular Aisles</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/shop?category=groceries" className="hover:text-white transition-colors">Pantry Groceries</Link></li>
              <li><Link to="/shop?category=meat-and-poultry" className="hover:text-white transition-colors">Butcher Meat & Poultry</Link></li>
              <li><Link to="/shop?category=dairy-and-eggs" className="hover:text-white transition-colors">Dairy Products & Eggs</Link></li>
              <li><Link to="/shop?category=fruits-and-vegetables" className="hover:text-white transition-colors">Fresh Fruits & Greens</Link></li>
              <li><Link to="/shop?category=beverages" className="hover:text-white transition-colors">Beverages & Water</Link></li>
              <li><Link to="/shop?category=cleaning-supplies" className="hover:text-white transition-colors">Cleaning Supplies</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/download-app" className="hover:text-white transition-colors text-orange-400 font-bold">📱 Download Mobile App</Link></li>
              <li><Link to="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">My Customer Account</Link></li>
              <li><Link to="/account?tab=orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Help & Contact Us</Link></li>
              <li><Link to="/faqs" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/account?tab=support" className="hover:text-white transition-colors">Submit Support Ticket</Link></li>
            </ul>
          </div>

          {/* Policies & Company */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Information</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About Mama Shopping Center</Link></li>
              <li><Link to="/delivery-policy" className="hover:text-white transition-colors">Delivery Coverage & Zones</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/shop?has_discount=true" className="hover:text-amber-400 transition-colors font-semibold">Special Weekly Discounts</Link></li>
            </ul>
          </div>

        </div>

        {/* Payment Methods & Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {currentYear} Mama Shopping Center Ltd. All rights reserved. Kampala, Uganda.
          </div>

          {/* Uganda Payment Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Accepted Payments:</span>
            <span className="px-2.5 py-1 rounded-md bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 font-bold text-[11px]">
              MTN MoMo
            </span>
            <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-[11px]">
              Airtel Money
            </span>
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold text-[11px]">
              Stanbic / Bank
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
              Cash on Delivery
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
