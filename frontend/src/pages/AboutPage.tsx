import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, Users, Award, MapPin } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface Props {
  settings: WebsiteSettings | null;
}

export const AboutPage: React.FC<Props> = ({ settings }) => {
  const aboutText = settings?.about_us || (
    "Mama Shopping Center is Kampala's premier single-owner supermarket dedicated to providing authentic, freshly stocked groceries, butcher meat, dairy products, bakery goods, and household essentials at affordable prices. Every product is sourced directly and inspected for maximum quality and freshness."
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E15712]">Our Supermarket Story</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          About Mama Shopping Center
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Kampala's premier neighborhood supermarket dedicated to quality, affordability, and lightning-fast home deliveries.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <p className="text-base font-medium text-slate-900 leading-relaxed">
          {aboutText}
        </p>
        
        <p>
          Unlike open online marketplaces where independent third-party vendors list unregulated stock, <strong>Mama Shopping Center is a single-owner commercial supermarket</strong>. We own our central store inventory, maintain stringent temperature controls, and fulfill every basket with dedicated staff.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#E15712] text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">100% Genuine Stock</h3>
            <p className="text-xs text-slate-600">Directly sourced from trusted Ugandan food producers and verified suppliers.</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#2FA0E1] text-white flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Express Kampala Fleet</h3>
            <p className="text-xs text-slate-600">Dispatched directly to your door across Kampala, Wakiso, and Entebbe.</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Quality Checked Daily</h3>
            <p className="text-xs text-slate-600">Butcher cuts and dairy inspected every morning for supreme freshness.</p>
          </div>
        </div>
      </div>

      {/* Store Location Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold text-[#E15712] uppercase tracking-wider">Physical Supermarket Location</span>
          <h3 className="text-xl font-bold">Visit Our Store in Kampala Central</h3>
          <p className="text-xs text-slate-300">Plot 24, Kampala Road, Central Division, Kampala, Uganda</p>
          <p className="text-xs text-slate-400">Open Daily: 7:00 AM – 10:00 PM</p>
        </div>
        <a
          href="/shop"
          className="px-6 py-3 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs font-bold rounded-full transition-colors shrink-0 shadow-md"
        >
          Browse Our Products Online
        </a>
      </div>

    </div>
  );
};
