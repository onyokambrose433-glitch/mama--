import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { WebsiteSettings } from '../types';
import apiClient from '../api/client';

interface Props {
  settings: WebsiteSettings | null;
}

export const ContactPage: React.FC<Props> = ({ settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const primaryPhone = settings?.primary_phone || '+256 700 892 100 / +256 772 892 100';
  const primaryEmail = settings?.primary_email || 'orders@mamashoppingcenter.com';
  const address = settings?.physical_address || 'Plot 24, Kampala Road, Central Division, Kampala, Uganda';
  const hours = settings?.business_hours || 'Monday – Sunday: 7:00 AM – 10:00 PM';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/contact/', {
        name,
        email,
        phone,
        subject,
        message,
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch {
      alert('Could not submit message. Please try calling our store lines directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E15712]">Direct Supermarket Support</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact Mama Shopping Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have an inquiry about an ongoing delivery, fresh butcher order, or bulk purchase? Our Kampala team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Card */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Store Contact Details
          </h3>

          <div className="space-y-5 text-xs text-slate-300">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-950/80 text-[#E15712] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Physical Store Address</span>
                <p className="font-semibold text-white mt-0.5">{address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 text-[#2FA0E1] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Customer Care & MoMo</span>
                <p className="font-semibold text-white mt-0.5">{primaryPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Email Inquiries</span>
                <p className="font-semibold text-white mt-0.5">{primaryEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Operating Hours</span>
                <p className="font-semibold text-white mt-0.5">{hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Send an Online Inquiry
          </h3>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your message has been sent to our management team. We will call or email you shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Ssebaggala"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+256 700 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="david@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bulk grocery order / Delivery question"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Message *</label>
              <textarea
                rows={4}
                required
                placeholder="How can Mama Shopping Center assist you today?..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#E15712] outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
