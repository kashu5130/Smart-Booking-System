import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Calendar, 
  UserCheck, 
  Layers, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  BookOpen,
  Clock,
  Code2,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'catalog' | 'my-bookings' | 'dashboard' | 'architecture';
  setCurrentTab: (tab: 'catalog' | 'my-bookings' | 'dashboard' | 'architecture') => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuthModal }) => {
  const { user, logout, switchPersona } = useAuth();
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  const personas = [
    {
      id: 'customer1',
      name: 'Alex Morgan',
      role: 'Customer',
      tag: 'Individual Client',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'customer2',
      name: 'Chloe Davis',
      role: 'Customer',
      tag: 'Group Class Client',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'provider1',
      name: 'Dr. Elena Vance, MD',
      role: 'Provider',
      tag: 'Physician Specialist',
      badgeClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      avatar: 'https://images.unsplash.com/photo-1594824813626-d62f49d2bc17?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'provider2',
      name: 'Marcus Sterling',
      role: 'Provider',
      tag: 'Physio & Mobility Coach',
      badgeClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'admin',
      name: 'Victoria Stone',
      role: 'Admin',
      tag: 'System Administrator',
      badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const handleSelectPersona = (pId: string) => {
    switchPersona(pId);
    setPersonaDropdownOpen(false);
  };

  const isStaff = user?.role === 'admin' || user?.role === 'provider';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentTab('catalog')} 
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-lg tracking-tight">SmartBooking</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">LIVE API</span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Real-Time Scheduling & Services</p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                currentTab === 'catalog'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Book Services
            </button>

            <button
              onClick={() => setCurrentTab('my-bookings')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                currentTab === 'my-bookings'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              My Appointments
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                currentTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Provider Dashboard</span>
              {isStaff && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('architecture')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                currentTab === 'architecture'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Architecture & API
            </button>
          </nav>

          {/* User Persona Switcher & Account Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all"
                title="Switch demo persona"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-white shadow-xs" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="truncate max-w-[110px]">{user?.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      user?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : user?.role === 'provider' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {personaDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setPersonaDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Test Personas</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">1-Click Switch</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Switch perspective to test RBAC roles & bookings</p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {personas.map((p) => {
                        const isCurrent = user?.name === p.name;
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleSelectPersona(p.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                              isCurrent ? 'bg-indigo-50 border border-indigo-200/60' : 'hover:bg-slate-50'
                            }`}
                          >
                            <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800 truncate">{p.name}</span>
                                {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${p.badgeClass}`}>
                                  {p.role}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate">{p.tag}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1 flex items-center justify-between px-2">
                      <button
                        onClick={() => {
                          setPersonaDropdownOpen(false);
                          onOpenAuthModal();
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2"
                      >
                        Custom Sign In / Register
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setPersonaDropdownOpen(false);
                        }}
                        className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 py-1 px-2"
                      >
                        <LogOut className="w-3 h-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 bg-slate-50/80 px-2 text-xs">
        <button
          onClick={() => setCurrentTab('catalog')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            currentTab === 'catalog' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Services</span>
        </button>
        <button
          onClick={() => setCurrentTab('my-bookings')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            currentTab === 'my-bookings' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Bookings</span>
        </button>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            currentTab === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setCurrentTab('architecture')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            currentTab === 'architecture' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Architecture</span>
        </button>
      </div>
    </header>
  );
};
