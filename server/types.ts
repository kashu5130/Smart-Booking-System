export type UserRole = 'admin' | 'provider' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  title?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  capacityPerSlot: number;
  providerId: string;
  providerName: string;
  cancellationWindowHours: number;
  operatingHours: {
    start: string; // e.g. "09:00"
    end: string;   // e.g. "17:00"
    slotIntervalMinutes: number; // e.g. 30 or 60
  };
  availableDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  isActive: boolean;
  imageUrl?: string;
  location?: string;
  createdAt: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "SB-9842"
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "10:00"
  durationMinutes: number;
  price: number;
  status: BookingStatus;
  notes?: string;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlotAvailability {
  time: string; // "09:00"
  totalCapacity: number;
  bookedCount: number;
  remainingCapacity: number;
  isAvailable: boolean;
  isPast: boolean;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
