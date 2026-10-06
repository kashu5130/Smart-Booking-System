import React, { useState } from 'react';
import { 
  FolderTree, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Clock, 
  Server, 
  Layers, 
  Copy, 
  Check, 
  Code2, 
  Cpu,
  Key
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const folderStructure = `smart-booking-system/
├── server/
│   ├── controllers/
│   │   ├── authController.ts        # Login, register, JWT session & demo personas
│   │   ├── serviceController.ts     # Service catalog & real-time slots computation
│   │   └── bookingController.ts     # Concurrency-safe booking, cancellations & stats
│   ├── db/
│   │   └── database.ts              # In-memory ACID slot locking store + seed data
│   ├── middleware/
│   │   └── auth.ts                  # JWT token verify & RBAC role authorization guards
│   ├── models/
│   │   └── mongooseSchemas.ts       # Mongoose schemas & MongoDB Atlas production guide
│   ├── routes/
│   │   └── api.ts                   # REST API router endpoints
│   └── types.ts                     # Strict TypeScript interfaces & models
├── src/
│   ├── components/
│   │   ├── Navbar.tsx               # Navigation bar & 1-click persona switcher
│   │   ├── ServiceCatalog.tsx       # Service discovery, category filters & search
│   │   ├── BookingModal.tsx         # Interactive slot picker & double-booking prevention
│   │   ├── MyBookings.tsx           # Appointment management & cancellation policy engine
│   │   ├── ProviderDashboard.tsx    # Admin/Provider schedule & slot capacity monitor
│   │   ├── ArchitectureDocs.tsx     # Full technical documentation & API contracts
│   │   └── AuthModal.tsx            # Custom register/login modal
│   ├── context/
│   │   └── AuthContext.tsx          # JWT Auth state & persona management
│   ├── lib/
│   │   └── api.ts                   # Typed API client with automatic Bearer token
│   ├── App.tsx                      # Main app shell & view switching
│   └── types.ts                     # Shared client TypeScript types
├── server.ts                        # Full-stack Node/Express entry point with Vite middleware
├── package.json                     # Scripts, dependencies & build configuration
└── README.md                        # Setup and architecture documentation`;

  const endpoints = [
    { method: 'POST', path: '/api/auth/register', auth: 'Public', desc: 'Registers new customer or provider account, returns JWT token.' },
    { method: 'POST', path: '/api/auth/login', auth: 'Public', desc: 'Authenticates with email & bcrypt password, returns JWT token.' },
    { method: 'POST', path: '/api/auth/demo', auth: 'Public', desc: '1-click switcher between Admin, Provider, and Customer demo personas.' },
    { method: 'GET', path: '/api/auth/me', auth: 'Bearer JWT', desc: 'Retrieves current authenticated user profile.' },
    { method: 'GET', path: '/api/services', auth: 'Public / Opt', desc: 'Lists services with optional filtering by category or keyword.' },
    { method: 'GET', path: '/api/services/:id/slots', auth: 'Public / Opt', desc: 'Computes real-time slot availability, booked count vs max capacity for ?date=YYYY-MM-DD.' },
    { method: 'POST', path: '/api/services', auth: 'Admin / Provider', desc: 'Creates new service with operating hours and slot capacity.' },
    { method: 'PUT', path: '/api/services/:id', auth: 'Admin / Owner', desc: 'Updates service details, capacity, cancellation window, and hours.' },
    { method: 'POST', path: '/api/bookings', auth: 'Customer / Any', desc: 'Atomic slot reservation. Prevents double-booking via concurrency locking.' },
    { method: 'GET', path: '/api/bookings/my', auth: 'Bearer JWT', desc: 'Retrieves authenticated user\'s bookings (or assigned provider bookings).' },
    { method: 'GET', path: '/api/bookings', auth: 'Admin / Provider', desc: 'Dashboard schedule query with filters by status, date, and provider.' },
    { method: 'POST', path: '/api/bookings/:id/cancel', auth: 'Bearer JWT', desc: 'Cancels appointment with strict cancellation policy check. Frees slot.' },
    { method: 'PATCH', path: '/api/bookings/:id/status', auth: 'Admin / Provider', desc: 'Updates booking status to confirmed, completed, or cancelled.' },
    { method: 'GET', path: '/api/metrics', auth: 'Admin / Provider', desc: 'Aggregated analytics: revenue, confirmed, completed, and cancellation rate.' },
  ];

  return (
    <div className="space-y-8 pb-16 text-slate-800">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-100 text-indigo-700">
            Full-Stack Deliverable
          </span>
          <span className="text-xs text-slate-400">Production-Ready Clean Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Architecture & Technical Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Complete engineering specification covering folder hierarchy, atomic concurrency handling, cancellation engine, REST API contracts, and deployment.
        </p>
      </div>

      {/* Grid: Concurrency & Cancellation Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Concurrency Rule */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">1. Double-Booking Prevention Logic</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Double bookings and capacity overruns are strictly prevented at both the database and transaction levels:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>
              <strong>Mutual Exclusion Lock:</strong> Every booking acquisition acquires an in-flight key <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">serviceId:date:timeSlot</code>.
            </li>
            <li>
              <strong>Atomic Capacity Validation:</strong> Active confirmed bookings are counted: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">confirmedCount &lt; service.capacityPerSlot</code>. If capacity is exhausted, the server returns <code className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-mono text-[11px]">409 Conflict</code>.
            </li>
            <li>
              <strong>Unique Compound Indexes:</strong> In MongoDB/Mongoose, a compound index on <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">&#123; serviceId, date, timeSlot, status &#125;</code> and user duplicate checks prevent race conditions.
            </li>
          </ul>
        </div>

        {/* Cancellation Engine */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">2. Cancellation Policy & Slot Reclaim</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Service providers define custom cancellation policies per service (e.g., 2 hours, 4 hours, or 24 hours):
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>
              <strong>Policy Window Verification:</strong> When a customer triggers cancellation, the engine checks: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">appointmentTime - currentTime &gt;= cancellationWindowHours</code>.
            </li>
            <li>
              <strong>Graceful Rejection:</strong> If within the lock-out period, the customer is barred from cancelling online and instructed to contact provider support.
            </li>
            <li>
              <strong>Automated Slot Restoration:</strong> When cancelled, the status changes to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">'cancelled'</code>, which automatically frees up the remaining capacity in the real-time slot calculator.
            </li>
          </ul>
        </div>
      </div>

      {/* REST API Endpoints Specification */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              REST API Endpoints Design
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">All endpoints mounted under <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">/api/*</code></p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Endpoint</th>
                <th className="py-2.5 px-3">Auth / Role</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {endpoints.map((ep, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3 font-bold">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                      ep.method === 'GET' ? 'bg-sky-100 text-sky-800' :
                      ep.method === 'PUT' ? 'bg-amber-100 text-amber-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{ep.path}</td>
                  <td className="py-2 px-3 text-slate-500 font-sans text-xs">{ep.auth}</td>
                  <td className="py-2 px-3 text-slate-600 font-sans text-xs">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Folder Structure */}
      <div className="p-6 rounded-3xl bg-slate-950 text-slate-200 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Project Hierarchy & Modular Layout</h3>
          </div>
          <button
            onClick={() => copyToClipboard(folderStructure, 'tree')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            {copiedSection === 'tree' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'tree' ? 'Copied' : 'Copy Tree'}</span>
          </button>
        </div>
        <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-4 rounded-2xl bg-slate-900 border border-slate-800">
          {folderStructure}
        </pre>
      </div>

      {/* Setup & Local Deployment Guide */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Setup & Local Deployment Guide</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
              Install Dependencies
            </span>
            <pre className="font-mono bg-slate-900 text-slate-200 p-2.5 rounded-xl text-[11px] overflow-x-auto">
npm install
            </pre>
            <p className="text-slate-500 text-[11px]">
              Installs React 19, Express, TypeScript, bcryptjs, jsonwebtoken, and Lucide icons.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
              Configure Environment
            </span>
            <pre className="font-mono bg-slate-900 text-slate-200 p-2.5 rounded-xl text-[11px] overflow-x-auto">
PORT=3000
JWT_SECRET=super-secret-key
MONGODB_URI=mongodb://...
            </pre>
            <p className="text-slate-500 text-[11px]">
              Optional MongoDB connection; falls back smoothly to in-memory ACID store.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
              Start Full-Stack App
            </span>
            <pre className="font-mono bg-slate-900 text-slate-200 p-2.5 rounded-xl text-[11px] overflow-x-auto">
npm run dev
# or npm run build && npm start
            </pre>
            <p className="text-slate-500 text-[11px]">
              Launches Node.js Express server on port 3000 with Vite middleware in dev mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
