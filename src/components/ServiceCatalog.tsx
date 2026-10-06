import React, { useState, useEffect } from 'react';
import { Service } from '../types.ts';
import { api } from '../lib/api.ts';
import { 
  Search, 
  Clock, 
  Users, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  ArrowRight,
  Filter,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

interface ServiceCatalogProps {
  onSelectService: (service: Service) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ onSelectService }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Healthcare', 'Therapy & Rehab', 'Fitness & Group', 'Consulting'];

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await api.getServices({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
      });
      setServices(res.services || []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadServices();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Real-Time Slot Engine • Strict Concurrency Protection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Book professional services with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">guaranteed slots</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Choose an appointment, inspect live slot capacity in real-time, and manage or cancel bookings transparently with automated policy enforcement.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Double-Booking Guarantee</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Transparent Cancellation Rules</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
              <Users className="w-4 h-4 text-violet-400 shrink-0" />
              <span>Multi-Role RBAC (Admin/Provider/Client)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search services or providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No services found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col overflow-hidden"
            >
              {/* Card Header Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={service.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80'}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/90 backdrop-blur-xs text-indigo-900 shadow-xs">
                    {service.category}
                  </span>
                  <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-slate-900/80 backdrop-blur-xs text-emerald-300 border border-emerald-400/30">
                    Cancel up to {service.cancellationWindowHours}h prior
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="text-xl font-extrabold tracking-tight">${service.price}</span>
                  <span className="text-xs font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-300" />
                    {service.durationMinutes} mins
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Provider and metadata */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-[10px]">
                        {service.providerName.split(' ')[0][0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-[11px] leading-tight">{service.providerName}</div>
                        <div className="text-[10px] text-slate-400">Verified Provider</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{service.capacityPerSlot > 1 ? `Group (${service.capacityPerSlot} max)` : '1-on-1 Session'}</span>
                    </div>
                  </div>

                  {service.location && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{service.location}</span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSelectService(service)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all group-hover:shadow-md"
                >
                  <span>Check Live Slots & Book</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
