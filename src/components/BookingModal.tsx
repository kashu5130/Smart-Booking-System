import React, { useState, useEffect } from 'react';
import { Service, TimeSlotAvailability, Booking } from '../types.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  X, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  User as UserIcon, 
  Phone, 
  FileText, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface BookingModalProps {
  service: Service | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ service, onClose, onBookingSuccess }) => {
  const { user } = useAuth();

  // Helper to format date YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Generate next 14 days
  const [availableDates, setAvailableDates] = useState<{ dateStr: string; dateObj: Date; dayName: string; monthDay: string; isOperatingDay: boolean }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [slots, setSlots] = useState<TimeSlotAvailability[]>([]);
  const [isOperatingDay, setIsOperatingDay] = useState<boolean>(true);

  // Form fields
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  // Step and submission state
  const [step, setStep] = useState<'slot' | 'details' | 'success'>('slot');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!service) return;

    const days = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      const isOp = service.availableDays.includes(dayOfWeek);
      days.push({
        dateStr: formatYMD(d),
        dateObj: d,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        monthDay: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isOperatingDay: isOp,
      });
    }

    setAvailableDates(days);

    // Pick first working day as default
    const firstWorking = days.find(d => d.isOperatingDay) || days[0];
    setSelectedDate(firstWorking.dateStr);
  }, [service]);

  // Load real-time slots when service or date changes
  useEffect(() => {
    if (!service || !selectedDate) return;

    let isMounted = true;
    setSlotsLoading(true);
    setErrorMessage(null);
    setSelectedSlot('');

    api.getServiceSlots(service.id, selectedDate)
      .then((res) => {
        if (!isMounted) return;
        setIsOperatingDay(res.isOperatingDay);
        setSlots(res.slots || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage(err.message || 'Failed to fetch real-time slots.');
      })
      .finally(() => {
        if (isMounted) setSlotsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [service, selectedDate]);

  if (!service) return null;

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot('');
    setErrorMessage(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedDate) {
      setErrorMessage('Please select an appointment time slot.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.createBooking({
        serviceId: service.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        notes,
        customCustomerName: customerName,
        customCustomerEmail: customerEmail,
        customCustomerPhone: customerPhone,
      });

      if (res.success && res.booking) {
        setCreatedBooking(res.booking);
        setStep('success');
        onBookingSuccess(res.booking);
      }
    } catch (err: any) {
      // If concurrency/double-booking caught, reload slots automatically!
      setErrorMessage(err.message || 'Booking failed.');
      // Refresh slots in real time
      api.getServiceSlots(service.id, selectedDate).then(r => setSlots(r.slots || []));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                {service.category}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {service.durationMinutes} mins
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">{service.name}</h2>
            <p className="text-xs text-indigo-200 mt-1">Provider: <span className="font-semibold text-white">{service.providerName}</span></p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6">
          {step === 'slot' && (
            <div className="space-y-6">
              {/* Date selection strip */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  1. Select Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {availableDates.map((item) => {
                    const isSelected = selectedDate === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        onClick={() => handleDateChange(item.dateStr)}
                        disabled={!item.isOperatingDay}
                        className={`flex flex-col items-center min-w-[72px] py-2.5 px-2 rounded-2xl border transition-all text-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-105'
                            : item.isOperatingDay
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                            : 'bg-slate-100/50 border-slate-200/50 text-slate-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span className="text-[11px] font-medium uppercase">{item.dayName}</span>
                        <span className={`text-base font-bold my-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {item.dateObj.getDate()}
                        </span>
                        <span className="text-[10px] opacity-80">
                          {item.isOperatingDay ? 'Open' : 'Off'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slot picker */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. Choose Real-Time Available Slot
                  </label>
                  <span className="text-xs text-slate-400">
                    Capacity: <span className="font-semibold text-slate-700">{service.capacityPerSlot} {service.capacityPerSlot === 1 ? 'person' : 'people'} / slot</span>
                  </span>
                </div>

                {slotsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="text-xs">Checking real-time slot capacity...</span>
                  </div>
                ) : !isOperatingDay ? (
                  <div className="p-6 text-center bg-amber-50 rounded-2xl border border-amber-200 text-amber-800">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                    <p className="text-sm font-semibold">Service Provider is not scheduled on this day</p>
                    <p className="text-xs text-amber-700 mt-1">Please select an alternate weekday above.</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    No operating slots configured for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {slots.map((s) => {
                      const isSelected = selectedSlot === s.time;
                      return (
                        <button
                          key={s.time}
                          type="button"
                          disabled={!s.isAvailable}
                          onClick={() => {
                            setSelectedSlot(s.time);
                            setErrorMessage(null);
                          }}
                          className={`relative p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-600/30 shadow-md'
                              : s.isAvailable
                              ? 'bg-white hover:bg-indigo-50/50 border-slate-200 text-slate-800 hover:border-indigo-300'
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{s.time}</span>
                            {s.isAvailable ? (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                isSelected ? 'bg-indigo-500/40 text-white' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {s.remainingCapacity} left
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 font-semibold">
                                {s.isPast ? 'Past' : 'Full'}
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {s.isAvailable 
                              ? (service.capacityPerSlot > 1 ? `${s.bookedCount}/${s.totalCapacity} booked` : 'Available')
                              : (s.isPast ? 'Time elapsed' : 'Double-booking locked')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Policy alert */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
                <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Cancellation Policy: </span>
                  Free cancellation up to <strong className="text-indigo-700">{service.cancellationWindowHours} hours</strong> before appointment start. Cancellations automatically return the slot to the public pool.
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-sm">
                  <span className="text-slate-400">Total: </span>
                  <span className="text-lg font-bold text-slate-900">${service.price}</span>
                </div>
                <button
                  onClick={() => setStep('details')}
                  disabled={!selectedSlot}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                >
                  Continue to Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              {/* Summary pill */}
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-indigo-950">{selectedDate} at {selectedSlot}</span>
                </div>
                <button 
                  onClick={() => setStep('slot')} 
                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Change Slot
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Notes / Special Requests (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Mention medical history, specific goals, or preferences..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('slot')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={submitting || !customerName || !customerEmail}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Reserving Slot...
                    </>
                  ) : (
                    <>
                      Confirm & Book (${service.price})
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && createdBooking && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Confirmed #{createdBooking.bookingReference}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">Appointment Reserved!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  A confirmation receipt and calendar invitation have been registered for {createdBooking.customerName}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service</span>
                  <span className="font-semibold text-slate-900">{createdBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider</span>
                  <span className="font-semibold text-slate-900">{createdBooking.providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot</span>
                  <span className="font-semibold text-slate-900">{createdBooking.date} @ {createdBooking.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-semibold text-emerald-600">${createdBooking.price}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                >
                  Close & View Appointments
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
