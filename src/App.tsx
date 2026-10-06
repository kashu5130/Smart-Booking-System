import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { ServiceCatalog } from './components/ServiceCatalog.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { MyBookings } from './components/MyBookings.tsx';
import { ProviderDashboard } from './components/ProviderDashboard.tsx';
import { ArchitectureDocs } from './components/ArchitectureDocs.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { Service, Booking } from './types.ts';
import { 
  Calendar, 
  ShieldCheck, 
  Code2, 
  Clock, 
  Github, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';

function MainLayout() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'catalog' | 'my-bookings' | 'dashboard' | 'architecture'>('catalog');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; sub?: string } | null>(null);

  const handleBookingSuccess = (booking: Booking) => {
    setNotification({
      message: `Appointment #${booking.bookingReference} reserved!`,
      sub: `Confirmed for ${booking.date} at ${booking.timeSlot} with ${booking.providerName}.`,
    });
    // Auto dismiss after 6s
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Floating Success Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 fade-in duration-200 flex items-start gap-3">
          <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-white text-sm">{notification.message}</div>
            {notification.sub && <p className="text-slate-300 mt-0.5">{notification.sub}</p>}
            <button
              onClick={() => {
                setCurrentTab('my-bookings');
                setNotification(null);
              }}
              className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline block"
            >
              View in My Appointments →
            </button>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'catalog' && (
          <ServiceCatalog onSelectService={(s) => setSelectedService(s)} />
        )}

        {currentTab === 'my-bookings' && (
          <MyBookings onBrowseServices={() => setCurrentTab('catalog')} />
        )}

        {currentTab === 'dashboard' && (
          <ProviderDashboard />
        )}

        {currentTab === 'architecture' && (
          <ArchitectureDocs />
        )}
      </main>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              S
            </div>
            <span className="font-bold text-slate-900">Smart Booking System</span>
            <span className="text-slate-400">• Real-Time Capacity & ACID Slot Protection</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button 
              onClick={() => setCurrentTab('architecture')} 
              className="hover:text-indigo-600 font-medium"
            >
              API Reference & Schemas
            </button>
            <span className="text-slate-300">|</span>
            <span>REST API on Express & React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
