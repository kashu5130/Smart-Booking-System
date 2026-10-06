# Smart Booking System (Full-Stack Architecture)

A production-grade, full-stack appointment booking and schedule management web platform engineered with React, Node.js (Express), JWT Authentication, Role-Based Access Control (RBAC), and a real-time slot availability & concurrency engine.

---

## 1. System Architecture & Folder Structure

```
smart-booking-system/
├── server/
│   ├── controllers/
│   │   ├── authController.ts        # Login, register, JWT session & demo personas
│   │   ├── serviceController.ts     # Service catalog & real-time slots computation
│   │   └── bookingController.ts     # Concurrency-safe booking, cancellations & stats
│   ├── db/
│   │   └── database.ts              # Concurrency-safe slot locking engine + seed data
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
└── README.md                        # Setup and architecture documentation
```

---

## 2. Core Business Logic & Concurrency Rules

### A. Double-Booking & Overcapacity Prevention
1. **Atomic Mutex Locks**: Before validating availability, the server acquires a temporary lock on the key `${serviceId}:${date}:${timeSlot}`.
2. **Capacity Validation**: The server verifies that existing confirmed bookings for that specific slot do not exceed `service.capacityPerSlot` (supporting both 1-on-1 sessions and group classes).
3. **HTTP 409 Conflict**: If another transaction claims the final seat concurrently, the server returns HTTP 409, automatically triggering a live reload of the frontend slot grid.
4. **Client Duplicate Protection**: Prevents the same user from holding two overlapping appointments at the identical time slot.

### B. Automated Cancellation Policy Engine
1. **Dynamic Time Windows**: Each service configures its own cancellation window (e.g. 2 hours, 4 hours, 24 hours).
2. **Policy Enforcement**: Customer cancellations verify that `(appointmentDateTime - now) >= cancellationWindowHours`. If the deadline has passed, the booking is locked from customer cancellation.
3. **Immediate Slot Reclamation**: When an appointment is cancelled, its status updates to `'cancelled'`, which instantly increments `remainingCapacity` on that slot for other prospective clients.

---

## 3. Database Schemas (Mongoose & SQL Ready)

### User Model
- `id` (String / ObjectId)
- `name` (String, required)
- `email` (String, required, unique, indexed)
- `passwordHash` (String, bcrypt hashed)
- `role` (`'admin' | 'provider' | 'customer'`)
- `phone` (String, optional)
- `avatarUrl` (String, optional)
- `title` (String, optional)
- `createdAt` (Timestamp)

### Service Model
- `id` (String / ObjectId)
- `name` (String, required)
- `description` (String)
- `category` (String, indexed)
- `durationMinutes` (Number, e.g. 45, 60)
- `price` (Number)
- `capacityPerSlot` (Number, default: 1)
- `providerId` (ObjectId ref User)
- `providerName` (String)
- `cancellationWindowHours` (Number, default: 2)
- `operatingHours` (`{ start: "09:00", end: "17:00", slotIntervalMinutes: 60 }`)
- `availableDays` (Array of Numbers, e.g. `[1, 2, 3, 4, 5]`)
- `isActive` (Boolean, default: true)

### Booking Model
- `id` (String / ObjectId)
- `bookingReference` (String, unique, indexed, e.g. `"SB-8041"`)
- `userId` (ObjectId ref User)
- `customerName` (String)
- `customerEmail` (String)
- `customerPhone` (String)
- `serviceId` (ObjectId ref Service)
- `serviceName` (String)
- `providerId` (ObjectId ref User)
- `providerName` (String)
- `date` (String, `YYYY-MM-DD`, indexed)
- `timeSlot` (String, `HH:mm`)
- `durationMinutes` (Number)
- `price` (Number)
- `status` (`'confirmed' | 'cancelled' | 'completed'`)
- `notes` (String)
- `cancelReason` (String)
- `cancelledAt` (Timestamp)
- `createdAt`, `updatedAt` (Timestamps)

---

## 4. REST API Endpoints Specification

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new account with role (`customer` or `provider`) |
| `POST` | `/api/auth/login` | Public | Authenticate with email/password; returns JWT |
| `POST` | `/api/auth/demo` | Public | 1-click test persona switcher (Admin, Provider, Customer) |
| `GET` | `/api/auth/me` | Bearer JWT | Returns current authenticated user profile |
| `GET` | `/api/services` | Public / Opt | List all active services (filterable by category & search) |
| `GET` | `/api/services/:id/slots` | Public / Opt | Returns real-time slot capacity & status for `?date=YYYY-MM-DD` |
| `POST` | `/api/services` | Admin / Provider | Create a new service with custom schedule & capacity |
| `PUT` | `/api/services/:id` | Admin / Owner | Update service pricing, capacity, hours, or policy |
| `POST` | `/api/bookings` | Bearer JWT | Concurrency-safe appointment booking (prevents double-booking) |
| `GET` | `/api/bookings/my` | Bearer JWT | Get authenticated user's appointments (or provider's clients) |
| `GET` | `/api/bookings` | Admin / Provider | Query all appointments with status/date filters |
| `POST` | `/api/bookings/:id/cancel`| Bearer JWT | Cancel booking with policy validation; restores slot capacity |
| `PATCH`| `/api/bookings/:id/status`| Admin / Provider | Mark appointment completed or confirmed |
| `GET` | `/api/metrics` | Admin / Provider | Dashboard analytics (revenue, count by status) |

---

## 5. Setup & Local Deployment Guide

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
```bash
# Clone or navigate to the repository
cd smart-booking-system

# Install dependencies
npm install
```

### Environment Configuration
Create a `.env` file (or copy `.env.example`):
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
```

### Run Locally
```bash
# Starts Express backend and mounts Vite development middleware on port 3000
npm run dev
```

### Production Build & Launch
```bash
npm run build
npm start
```
