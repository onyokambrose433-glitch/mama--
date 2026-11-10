import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Package,
  MapPin,
  Lock,
  HelpCircle,
  Clock,
  Printer,
  XCircle,
  Plus,
  Trash2,
  CheckCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order, Address } from '../types';
import { formatUGX, formatDateTime } from '../utils/format';
import apiClient from '../api/client';

export const AccountPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/account');
    }
  }, [user, navigate]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newDivision, setNewDivision] = useState('');
  const [newCity, setNewCity] = useState('Kampala');
  const [newInstructions, setNewInstructions] = useState('');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Support Tickets State
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketMsgSuccess, setTicketMsgSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [ordersRes, addrRes, ticketsRes] = await Promise.all([
          apiClient.get<any>('/orders/'),
          apiClient.get<Address[]>('/addresses/'),
          apiClient.get<any[]>('/support/tickets/'),
        ]);
        setOrders((ordersRes.data as any).results || ordersRes.data);
        setAddresses(addrRes.data);
        setTickets((ticketsRes.data as any).results || ticketsRes.data);
      } catch (err) {
        console.error('Failed to load user account data', err);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleCancelOrder = async (orderNumber: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await apiClient.post(`/orders/${orderNumber}/cancel/`, { reason: 'Customer requested cancellation' });
      const res = await apiClient.get<any>('/orders/');
      setOrders((res.data as any).results || res.data);
      if (selectedOrder?.order_number === orderNumber) {
        const updated = await apiClient.get<Order>(`/orders/${orderNumber}/`);
        setSelectedOrder(updated.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not cancel order.');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/addresses/', {
        full_name: newFullName,
        phone_number: newPhone,
        street_address: newStreet,
        division_or_area: newDivision,
        city: newCity,
        delivery_instructions: newInstructions,
        is_default: addresses.length === 0,
      });
      setShowAddressModal(false);
      const res = await apiClient.get<Address[]>('/addresses/');
      setAddresses(res.data);
      // Reset form
      setNewFullName('');
      setNewPhone('');
      setNewStreet('');
      setNewDivision('');
      setNewInstructions('');
    } catch {
      alert('Could not save address. Please verify your input.');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      await apiClient.delete(`/addresses/${id}/`);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch {
      alert('Could not delete address.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      await apiClient.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.old_password || err.response?.data?.new_password || 'Could not update password.';
      setPasswordMsg({ type: 'error', text: String(msg) });
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/support/tickets/', {
        subject: ticketSubject,
        message: ticketMessage,
      });
      setTicketMsgSuccess(true);
      setTicketSubject('');
      setTicketMessage('');
      const res = await apiClient.get<any[]>('/support/tickets/');
      setTickets((res.data as any).results || res.data);
    } catch {
      alert('Could not submit ticket.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Account Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#E15712] font-black text-xl flex items-center justify-center">
            {user.first_name ? user.first_name[0].toUpperCase() : 'M'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-xs text-slate-500">{user.email} • {user.phone || 'No phone set'}</p>
          </div>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 text-[#E15712] border border-orange-200">
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-1 bg-white p-3 rounded-2xl border border-slate-200 h-fit">
          {[
            { id: 'orders', label: 'My Orders', icon: Package },
            { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
            { id: 'support', label: 'Support & Tickets', icon: HelpCircle },
            { id: 'security', label: 'Account Security', icon: Lock },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  isCurrent
                    ? 'bg-[#E15712] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          
          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  My Order History ({orders.length})
                </h3>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <Package className="w-12 h-12 stroke-1 mx-auto text-slate-300 mb-2" />
                    You haven't placed any orders yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all space-y-3 bg-slate-50/50"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3 text-xs">
                          <div>
                            <span className="font-mono font-black text-slate-900 text-sm">{ord.order_number}</span>
                            <span className="text-slate-400 ml-2">Placed on {formatDateTime(ord.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-[#E15712]'
                            }`}>
                              {ord.status_display}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              ord.payment_status === 'paid' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              Payment: {ord.payment_status_display}
                            </span>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="text-xs text-slate-600 space-y-1">
                          {ord.items.map((it) => (
                            <div key={it.id} className="flex justify-between">
                              <span>{it.quantity}x {it.product_name}</span>
                              <span className="font-semibold">{formatUGX(it.subtotal)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Actions */}
                        <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-slate-500">Total: </span>
                            <span className="font-black text-slate-900 text-sm">{formatUGX(ord.total_amount)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {['pending', 'awaiting_payment'].includes(ord.status) && (
                              <button
                                onClick={() => handleCancelOrder(ord.order_number)}
                                className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
                              >
                                Cancel Order
                              </button>
                            )}
                            <Link
                              to={`/order-confirmation/${ord.order_number}`}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                            >
                              View Full Invoice
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DELIVERY ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Saved Delivery Addresses</h3>
                  <p className="text-xs text-slate-500">Manage saved locations for one-click checkout</p>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#E15712] text-white text-xs font-bold rounded-xl hover:bg-[#c4470a] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <MapPin className="w-10 h-10 stroke-1 mx-auto text-slate-300 mb-2" />
                  No delivery addresses saved yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-4 rounded-2xl border border-slate-200 space-y-2 relative">
                      {addr.is_default && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#E15712]">
                          Default Address
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-slate-900">{addr.full_name}</h4>
                      <p className="text-xs text-slate-600">{addr.street_address}, {addr.division_or_area}, {addr.city}</p>
                      <p className="text-xs text-slate-500">{addr.phone_number}</p>
                      {addr.delivery_instructions && (
                        <p className="text-[11px] text-slate-400 italic">Instructions: {addr.delivery_instructions}</p>
                      )}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Address Modal */}
              {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Add New Delivery Address</h3>
                    <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Street Address / House</label>
                        <input
                          type="text"
                          required
                          value={newStreet}
                          onChange={(e) => setNewStreet(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Division / Area in Kampala</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kololo, Nakawa, Ntinda, Kira"
                          value={newDivision}
                          onChange={(e) => setNewDivision(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">City</label>
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Directions (Optional)</label>
                        <input
                          type="text"
                          value={newInstructions}
                          onChange={(e) => setNewInstructions(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div className="flex gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddressModal(false)}
                          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-[#E15712] hover:bg-[#c4470a] text-white rounded-xl font-bold"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUPPORT TICKETS */}
          {activeTab === 'support' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Customer Support & Inquiries
              </h3>

              {/* Submit Ticket Form */}
              <form onSubmit={handleCreateTicket} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Submit a New Support Ticket</h4>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Subject e.g. Question about order delivery"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
                <div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your inquiry or order assistance needed..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
                {ticketMsgSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold">Your ticket has been logged. Our support staff will respond shortly.</p>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Send Support Request
                </button>
              </form>

              {/* Tickets List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Ticket History</h4>
                {tickets.length === 0 ? (
                  <p className="text-xs text-slate-400">No support tickets created yet.</p>
                ) : (
                  tickets.map((t) => (
                    <div key={t.id} className="p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{t.subject} ({t.ticket_number})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-[#2FA0E1]">
                          {t.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{formatDateTime(t.created_at)}</div>
                      {t.messages && t.messages.map((m: any) => (
                        <div
                          key={m.id}
                          className={`p-2.5 rounded-xl mt-2 ${
                            m.is_staff_reply ? 'bg-orange-50 border border-orange-100 ml-4' : 'bg-slate-50'
                          }`}
                        >
                          <div className="font-bold text-[11px] text-slate-700">
                            {m.is_staff_reply ? 'Mama Support Representative' : 'You'}:
                          </div>
                          <div className="text-slate-600 mt-0.5">{m.message}</div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs max-w-md space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Account Security & Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">New Password (at least 8 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                {passwordMsg.text && (
                  <p className={`text-xs font-semibold ${passwordMsg.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {passwordMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};
