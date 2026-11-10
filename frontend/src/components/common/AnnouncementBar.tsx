import React from 'react';
import { Phone, Clock, Truck } from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface Props {
  settings: WebsiteSettings | null;
}

export const AnnouncementBar: React.FC<Props> = ({ settings }) => {
  if (settings && !settings.announcement_is_active) {
    return null;
  }

  const phone = settings?.primary_phone || '+256 700 892 100';
  const hours = settings?.business_hours || 'Mon – Sun: 7:00 AM – 10:00 PM';
  const announcement = settings?.announcement_text || '🚚 Fresh groceries delivered across Kampala! Free delivery on orders over UGX 100,000.';

  return (
    <div className="bg-[#E15712] text-white text-xs py-2 px-4 border-b border-[#c4470a]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-center md:text-left font-medium">
          <Truck className="w-4 h-4 shrink-0 text-amber-200" />
          <span>{announcement}</span>
        </div>
        <div className="flex items-center space-x-4 text-xs font-normal opacity-95">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-200" />
            {hours}
          </span>
          <span className="hidden sm:inline">|</span>
          <a href={`tel:${phone.split('/')[0].trim()}`} className="flex items-center gap-1 hover:underline">
            <Phone className="w-3.5 h-3.5 text-amber-200" />
            {phone}
          </a>
        </div>
      </div>
    </div>
  );
};
