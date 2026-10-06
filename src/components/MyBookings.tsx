import React, { useState, useEffect } from 'react';
import { Booking, Service } from '../types.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Trash2, 
  MapPin, 
  FileText, 
  ShieldAlert, 
  DollarSign, 
  ArrowRight,
  Loader2,
  ChevronRight
} from 'lucide-react';

interface MyBookingsProps {
  onBrowseServices: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onBrowseServices }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [servicesMap, setServicesMap] = useState<Record<string, Service>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Cancel Modal state
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.getMyBookings(),
        api.getServices({ includeInactive: true }),
      ]);

      setBookings(bookingsRes.bookings || []);

      const sMap: Record<string, Service> = {};
      (servicesRes.services || []).forEach(s => {
        sMap[s.id] = s;
      });
      setServicesMap(sMap);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Compute time until appointment in hours
  const getTimeRemainingHours = (dateStr: string, timeStr: string) => {
    const appointmentDate = new Date(`${dateStr}T${timeStr}:00`);
    const diffMs = appointmentDate.getTime() - Date.now();
    return diffMs / (1000 * 60 * 60);
  };

  const handleOpenCancelModal = (b: Booking) => {
    setCancelModalBooking(b);
    setCancelReason('');
    setActionError(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;

    setCancelling(true);
    setActionError(null);

    try {
      const res = await api.cancelBooking(
        cancelModalBooking.id,
        cancelReason || 'Customer requested cancellation'
      );

      setSuccessBanner(res.message || 'Booking cancelled successfully. Slot freed.');
      setCancelModalBooking(null);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Cancellation rejected by policy engine.');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      const hoursRemaining = getTimeRemainingHours(b.date, b.timeSlot);
      return b.status === 'confirmed' && hoursRemaining > -2; // upcoming or currently active
    }
    if (filter === 'completed') {
      const hoursRemaining = getTimeRemainingHours(b.date, b.timeSlot);
      return b.status === 'completed' || (b.status === 'confirmed' && hoursRemaining <= -2);
    }
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your scheduled sessions, verify real-time status, and exercise cancellation rights.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)} 
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['upcoming', 'all', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize whitespace-nowrap ${
              filter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800">
              {bookings.filter((b) => {
                if (tab === 'all') return true;
                if (tab === 'upcoming') return b.status === 'confirmed' && getTimeRemainingHours(b.date, b.timeSlot) > -2;
                if (tab === 'completed') return b.status === 'completed' || (b.status === 'confirmed' && getTimeRemainingHours(b.date, b.timeSlot) <= -2);
                if (tab === 'cancelled') return b.status === 'cancelled';
                return true;
              }).length}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No appointments found in this view</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {filter === 'upcoming' 
              ? "You don't have any upcoming reservations scheduled. Browse our services to reserve a slot."
              : 'No matching bookings found.'}
          </p>
          <button
            onClick={onBrowseServices}
            className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            Browse Services
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const service = servicesMap[booking.serviceId];
            const cancellationWindowHours = service?.cancellationWindowHours ?? 2;
            const hoursRemaining = getTimeRemainingHours(booking.date, booking.timeSlot);
            const canCancelByPolicy = hoursRemaining >= cancellationWindowHours;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Reference, Service, Provider */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        #{booking.bookingReference}
                      </span>

                      {/* Status Badges */}
                      {booking.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirmed
                        </span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelled
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{booking.serviceName}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Provider: {booking.providerName}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{booking.durationMinutes} mins</span>
                      </div>

                      <div className="font-semibold text-slate-900">
                        ${booking.price}
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                        "Notes: {booking.notes}"
                      </p>
                    )}

                    {booking.status === 'cancelled' && booking.cancelReason && (
                      <div className="text-xs text-rose-700 bg-rose-50/70 p-2 rounded-xl border border-rose-200">
                        <span className="font-semibold">Cancellation reason: </span>
                        {booking.cancelReason}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Time Slot & Action */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="lg:text-right">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 lg:justify-end">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        {booking.date}
                      </div>
                      <div className="text-xs font-semibold text-indigo-600 mt-0.5">
                        {booking.timeSlot}
                      </div>
                    </div>

                    {/* Cancellation & Policy status */}
                    {booking.status === 'confirmed' && (
                      <div className="space-y-1.5 lg:text-right">
                        {canCancelByPolicy ? (
                          <>
                            <div className="text-[11px] text-emerald-700 flex items-center gap-1 lg:justify-end font-medium">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Free cancellation available ({hoursRemaining > 24 ? `${Math.floor(hoursRemaining / 24)}d ${Math.floor(hoursRemaining % 24)}h left` : `${hoursRemaining.toFixed(1)}h left`})
                            </div>
                            <button
                              onClick={() => handleOpenCancelModal(booking)}
                              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Cancel Appointment
                            </button>
                          </>
                        ) : (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 max-w-xs text-left lg:text-right">
                            <span className="font-semibold">Cancellation window closed: </span>
                            Policy requires at least {cancellationWindowHours}h advance notice. Contact provider directly.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Cancel Appointment?</h3>
              <p className="text-xs text-slate-500 mt-1">
                You are about to cancel booking <strong className="text-slate-800">#{cancelModalBooking.bookingReference}</strong> for{' '}
                <span className="font-semibold text-slate-800">{cancelModalBooking.serviceName}</span> on {cancelModalBooking.date} at {cancelModalBooking.timeSlot}.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                Upon confirmation, this time slot will immediately be made available again for other clients to book.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation (Optional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Schedule conflict, feeling unwell..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Keep Appointment
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-600/20 disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
