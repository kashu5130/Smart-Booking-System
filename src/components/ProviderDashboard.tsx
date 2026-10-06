import React, { useState, useEffect } from 'react';
import { Booking, Service, SystemMetrics, User } from '../types.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  Eye, 
  Filter,
  Check,
  X,
  Loader2,
  ChevronRight
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { user, switchPersona } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'services' | 'slot-monitor'>('bookings');

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for bookings
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchBookingQuery, setSearchBookingQuery] = useState('');

  // Service Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    category: 'Healthcare',
    durationMinutes: 45,
    price: 100,
    capacityPerSlot: 1,
    cancellationWindowHours: 2,
    operatingStart: '09:00',
    operatingEnd: '17:00',
    slotIntervalMinutes: 60,
    providerId: user?.id || '',
    availableDays: [1, 2, 3, 4, 5], // Mon-Fri
    location: 'Main Clinic & Telehealth',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
  });

  // Slot Monitor state
  const [monitorServiceId, setMonitorServiceId] = useState<string>('');
  const [monitorDate, setMonitorDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [monitorSlots, setMonitorSlots] = useState<any[]>([]);
  const [monitorLoading, setMonitorLoading] = useState(false);

  // Status notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isStaff = user?.role === 'admin' || user?.role === 'provider';

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [mRes, bRes, sRes, pRes] = await Promise.all([
        api.getMetrics().catch(() => ({ success: false, metrics: null })),
        api.getAllBookings().catch(() => ({ success: false, bookings: [] })),
        api.getServices({ includeInactive: true }).catch(() => ({ success: false, services: [] })),
        api.getProviders().catch(() => ({ success: false, providers: [] })),
      ]);

      if (mRes.metrics) setMetrics(mRes.metrics);
      if (bRes.bookings) setBookings(bRes.bookings);
      if (sRes.services) {
        setServices(sRes.services);
        if (!monitorServiceId && sRes.services.length > 0) {
          setMonitorServiceId(sRes.services[0].id);
        }
      }
      if (pRes.providers) setProviders(pRes.providers);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  // Load slot monitor data
  useEffect(() => {
    if (!monitorServiceId || !monitorDate) return;
    setMonitorLoading(true);
    api.getServiceSlots(monitorServiceId, monitorDate)
      .then((res) => {
        setMonitorSlots(res.slots || []);
      })
      .catch((err) => {
        console.error('Failed to monitor slots:', err);
      })
      .finally(() => {
        setMonitorLoading(false);
      });
  }, [monitorServiceId, monitorDate]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      setFeedback({ type: 'success', message: `Booking status updated to ${newStatus}.` });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Status update failed.' });
    }
  };

  const handleAdminCancel = async (bookingId: string) => {
    const reason = window.prompt('Enter reason for administrative cancellation:');
    if (reason === null) return;

    try {
      await api.cancelBooking(bookingId, reason || 'Cancelled by provider/admin', true);
      setFeedback({ type: 'success', message: 'Booking cancelled and slot capacity restored.' });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Cancellation failed.' });
    }
  };

  const handleOpenCreateService = () => {
    setEditingService(null);
    setServiceFormData({
      name: '',
      description: '',
      category: 'Healthcare',
      durationMinutes: 45,
      price: 120,
      capacityPerSlot: 1,
      cancellationWindowHours: 2,
      operatingStart: '09:00',
      operatingEnd: '17:00',
      slotIntervalMinutes: 60,
      providerId: user?.id || (providers[0]?.id || ''),
      availableDays: [1, 2, 3, 4, 5],
      location: 'Suite 400 & Online',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (s: Service) => {
    setEditingService(s);
    setServiceFormData({
      name: s.name,
      description: s.description,
      category: s.category,
      durationMinutes: s.durationMinutes,
      price: s.price,
      capacityPerSlot: s.capacityPerSlot,
      cancellationWindowHours: s.cancellationWindowHours,
      operatingStart: s.operatingHours?.start || '09:00',
      operatingEnd: s.operatingHours?.end || '17:00',
      slotIntervalMinutes: s.operatingHours?.slotIntervalMinutes || 60,
      providerId: s.providerId,
      availableDays: s.availableDays,
      location: s.location || '',
      imageUrl: s.imageUrl || '',
    });
    setIsServiceModalOpen(true);
  };

  const handleToggleServiceActive = async (s: Service) => {
    try {
      await api.updateService(s.id, { isActive: !s.isActive });
      setFeedback({ type: 'success', message: `Service ${s.isActive ? 'deactivated' : 'activated'}.` });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const payload = {
      name: serviceFormData.name,
      description: serviceFormData.description,
      category: serviceFormData.category,
      durationMinutes: Number(serviceFormData.durationMinutes),
      price: Number(serviceFormData.price),
      capacityPerSlot: Number(serviceFormData.capacityPerSlot),
      cancellationWindowHours: Number(serviceFormData.cancellationWindowHours),
      operatingHours: {
        start: serviceFormData.operatingStart,
        end: serviceFormData.operatingEnd,
        slotIntervalMinutes: Number(serviceFormData.slotIntervalMinutes),
      },
      availableDays: serviceFormData.availableDays,
      providerId: serviceFormData.providerId || user?.id,
      location: serviceFormData.location,
      imageUrl: serviceFormData.imageUrl,
    };

    try {
      if (editingService) {
        await api.updateService(editingService.id, payload);
        setFeedback({ type: 'success', message: 'Service successfully updated.' });
      } else {
        await api.createService(payload);
        setFeedback({ type: 'success', message: 'New service created and slots generated.' });
      }
      setIsServiceModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save service.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all bookings and services to initial sample seed state?')) return;
    try {
      await api.resetDemoData();
      setFeedback({ type: 'success', message: 'Database reset to default sample state.' });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // If viewing as a Customer, provide a warm permission banner with a 1-click persona switch
  if (!isStaff) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 text-center shadow-lg space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Provider & Administrator Portal</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You are currently signed in as <strong className="text-slate-800">{user?.name} (Customer)</strong>. The management dashboard requires an Admin or Provider role.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => switchPersona('admin')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            Switch to Admin (Victoria Stone)
          </button>
          <button
            onClick={() => switchPersona('provider1')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            Switch to Provider (Dr. Elena Vance)
          </button>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchBookingQuery) {
      const q = searchBookingQuery.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.bookingReference.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Persona Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Management Dashboard
            </h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {user?.role} Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time schedule monitoring, service configuration, and booking lifecycle controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-xs"
          >
            Refresh
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={handleResetDemoData}
              title="Reset sample data"
              className="px-3 py-1.5 rounded-xl border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Bookings</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics?.totalBookings ?? bookings.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all services</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Confirmed</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{metrics?.confirmedCount ?? 0}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Live active slots</div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Completed</span>
          <div className="text-2xl font-black text-blue-800 mt-1">{metrics?.completedCount ?? 0}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Finished sessions</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Cancelled</span>
          <div className="text-2xl font-black text-rose-800 mt-1">{metrics?.cancelledCount ?? 0}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Slots freed</div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">Gross Bookings</span>
          <div className="text-2xl font-black text-indigo-900 mt-1">${metrics?.totalRevenue ?? 0}</div>
          <div className="text-[10px] text-indigo-600 mt-0.5">Realized revenue</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Bookings & Schedule ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'services'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Services Management ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('slot-monitor')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'slot-monitor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Live Slot Capacity Monitor</span>
        </button>
      </div>

      {/* TAB 1: BOOKINGS LIST */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                    statusFilter === s ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search reference, client name, service..."
              value={searchBookingQuery}
              onChange={(e) => setSearchBookingQuery(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No bookings matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        #{b.bookingReference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{b.customerName}</div>
                        <div className="text-[10px] text-slate-400">{b.customerEmail}</div>
                        {b.customerPhone && <div className="text-[10px] text-slate-400">{b.customerPhone}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{b.serviceName}</div>
                        <div className="text-[10px] text-slate-400">Provider: {b.providerName}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{b.date}</div>
                        <div className="text-indigo-600 font-bold">{b.timeSlot} ({b.durationMinutes}m)</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        ${b.price}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'confirmed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : b.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(b.id, 'completed')}
                                title="Mark Completed"
                                className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px]"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleAdminCancel(b.id)}
                                title="Cancel Booking"
                                className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px]"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {b.status === 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(b.id, 'confirmed')}
                              title="Restore"
                              className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px]"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICES MANAGEMENT */}
      {activeSubTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configured Services</h3>
              <p className="text-xs text-slate-500">Manage pricing, durations, slot capacities, and operating hours</p>
            </div>
            <button
              onClick={handleOpenCreateService}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Create Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
              <div
                key={s.id}
                className={`p-5 rounded-3xl border transition-all ${
                  s.isActive ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200/60 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700">
                        {s.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{s.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <span className="text-lg font-black text-slate-900">${s.price}</span>
                    <span className="block text-[10px] text-slate-400">{s.durationMinutes} mins</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Capacity / Slot</span>
                    <span className="font-semibold text-slate-800">
                      {s.capacityPerSlot} {s.capacityPerSlot === 1 ? 'person (1-on-1)' : 'participants (Group)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cancellation Policy</span>
                    <span className="font-semibold text-slate-800">
                      Up to {s.cancellationWindowHours}h prior
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Operating Hours</span>
                    <span className="font-semibold text-slate-800">
                      {s.operatingHours?.start} - {s.operatingHours?.end} ({s.operatingHours?.slotIntervalMinutes}m interval)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Provider</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {s.providerName}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleServiceActive(s)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    {s.isActive ? 'Deactivate Service' : 'Activate Service'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditService(s)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                      title="Edit Service"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME SLOT MONITOR */}
      {activeSubTab === 'slot-monitor' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Live Slot Capacity Engine Inspector
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Inspect real-time slot occupancy and atomic capacity validation for any service & date.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Service selector */}
                <select
                  value={monitorServiceId}
                  onChange={(e) => setMonitorServiceId(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 px-3 py-2 rounded-xl text-xs focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.capacityPerSlot} per slot)
                    </option>
                  ))}
                </select>

                {/* Date input */}
                <input
                  type="date"
                  value={monitorDate}
                  onChange={(e) => setMonitorDate(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 px-3 py-2 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            {monitorLoading ? (
              <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span className="text-xs">Computing live slot distribution...</span>
              </div>
            ) : monitorSlots.length === 0 ? (
              <div className="p-6 text-center bg-slate-800/50 rounded-2xl text-xs text-slate-400">
                Provider has no operating intervals scheduled for this day.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {monitorSlots.map((slot) => {
                  const pct = Math.round((slot.bookedCount / slot.totalCapacity) * 100);
                  return (
                    <div
                      key={slot.time}
                      className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{slot.time}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          slot.isAvailable 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {slot.isAvailable ? 'Available' : (slot.isPast ? 'Past' : 'Locked/Full')}
                        </span>
                      </div>

                      {/* Capacity visual bar */}
                      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            pct >= 100 ? 'bg-rose-500' : pct > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Booked: {slot.bookedCount}/{slot.totalCapacity}</span>
                        <span>Open: {slot.remainingCapacity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SERVICE MODAL (CREATE / EDIT) */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingService ? 'Edit Service' : 'Create New Service'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  placeholder="e.g. Sports Physiotherapy Intake"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  placeholder="Comprehensive assessment and treatment plan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="Healthcare">Healthcare</option>
                    <option value="Therapy & Rehab">Therapy & Rehab</option>
                    <option value="Fitness & Group">Fitness & Group</option>
                    <option value="Consulting">Consulting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    value={serviceFormData.durationMinutes}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity / Slot</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={serviceFormData.capacityPerSlot}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, capacityPerSlot: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cancel Window (Hrs)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={serviceFormData.cancellationWindowHours}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, cancellationWindowHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={serviceFormData.operatingStart}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, operatingStart: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={serviceFormData.operatingEnd}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, operatingEnd: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Provider</label>
                  <select
                    value={serviceFormData.providerId}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, providerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-sm"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
