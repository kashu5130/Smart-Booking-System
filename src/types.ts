export type UserRole = 'admin' | 'provider' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
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
    start: string;
    end: string;
    slotIntervalMinutes: number;
  };
  availableDays: number[];
  isActive: boolean;
  imageUrl?: string;
  location?: string;
  createdAt: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
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
  time: string;
  totalCapacity: number;
  bookedCount: number;
  remainingCapacity: number;
  isAvailable: boolean;
  isPast: boolean;
}

export interface SystemMetrics {
  totalBookings: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  activeServicesCount: number;
  totalCustomers: number;
  totalRevenue: number;
}
