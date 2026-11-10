import React from 'react';
import { useLocation } from 'react-router-dom';
import { WebsiteSettings } from '../types';

interface Props {
  settings: WebsiteSettings | null;
}

export const PolicyPage: React.FC<Props> = ({ settings }) => {
  const location = useLocation();
  const isDelivery = location.pathname.includes('delivery');
  const isTerms = location.pathname.includes('terms');
  const isPrivacy = location.pathname.includes('privacy');

  let title = 'Supermarket Policy';
  let content = '';

  if (isDelivery) {
    title = 'Delivery Policy & Coverage Areas';
    content = settings?.delivery_policy || (
      "We deliver throughout Kampala Central, Nakawa, Makindye, Rubaga, Kawempe, Kira, Wakiso, and Entebbe. Orders placed between 7:30 AM and 6:00 PM are delivered the same day within 2-3 hours. Perishable and cold items are safely transported in insulated containers."
    );
  } else if (isTerms) {
    title = 'Terms & Conditions of Service';
    content = settings?.terms_and_conditions || (
      "Mama Shopping Center ensures that all products displayed on our platform are genuine supermarket stock. Prices are stated in Uganda Shillings (UGX). Orders may be confirmed upon placement or payment receipt."
    );
  } else if (isPrivacy) {
    title = 'Customer Privacy Policy';
    content = settings?.privacy_policy || (
      "At Mama Shopping Center, your personal details, delivery addresses, and contact numbers are used strictly for fulfilling your grocery orders and account management. We never sell your personal data."
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E15712]">Mama Shopping Center</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};
