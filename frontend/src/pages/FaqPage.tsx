import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../api/client';

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await apiClient.get<any[]>('/faqs/');
        setFaqs((res.data as any).results || res.data);
        if (res.data.length > 0) {
          setOpenId(res.data[0].id);
        }
      } catch {
        // Fallback
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2FA0E1]">Common Questions</span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Everything you need to know about supermarket shopping, same-day delivery, and payments in Kampala.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs divide-y divide-slate-100">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="py-4 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-slate-900 hover:text-[#E15712] transition-colors"
              >
                <span>{faq.question}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-[#E15712] shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>
              {isOpen && (
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed pl-1">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
