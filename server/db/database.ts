import bcrypt from 'bcryptjs';
import { User, Service, Booking, TimeSlotAvailability, BookingStatus } from '../types.ts';

// In-Memory Database store with concurrency controls and seed data
class DatabaseStore {
  private users: Map<string, User> = new Map();
  private services: Map<string, Service> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private mutexLocks: Set<string> = new Set(); // Key: `${serviceId}:${date}:${timeSlot}`

  constructor() {
    this.seedDatabase();
  }

  public seedDatabase() {
    this.users.clear();
    this.services.clear();
    this.bookings.clear();

    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('Password123!', salt);

    // 1. Users (Admin, Providers, Customers)
    const admin: User = {
      id: 'usr_admin',
      name: 'Victoria Stone',
      email: 'admin@smartbooking.com',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      phone: '+1 (555) 019-2831',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      title: 'Head of Operations & System Admin',
      createdAt: new Date().toISOString(),
    };

    const provider1: User = {
      id: 'usr_prov_1',
      name: 'Dr. Elena Vance, MD',
      email: 'dr.elena@smartbooking.com',
      passwordHash: defaultPasswordHash,
      role: 'provider',
      phone: '+1 (555) 234-5678',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813626-d62f49d2bc17?w=150&auto=format&fit=crop&q=80',
      title: 'Senior Physician & Wellness Specialist',
      createdAt: new Date().toISOString(),
    };

    const provider2: User = {
      id: 'usr_prov_2',
      name: 'Marcus Sterling',
      email: 'marcus@smartbooking.com',
      passwordHash: defaultPasswordHash,
      role: 'provider',
      phone: '+1 (555) 876-5432',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: 'Master Physiotherapist & Sports Coach',
      createdAt: new Date().toISOString(),
    };

    const provider3: User = {
      id: 'usr_prov_3',
      name: 'Sarah Jenkins, CPA',
      email: 'sarah@smartbooking.com',
      passwordHash: defaultPasswordHash,
      role: 'provider',
      phone: '+1 (555) 456-7890',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      title: 'Executive Financial Consultant',
      createdAt: new Date().toISOString(),
    };

    const customer1: User = {
      id: 'usr_cust_1',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      passwordHash: defaultPasswordHash,
      role: 'customer',
      phone: '+1 (555) 345-6789',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    const customer2: User = {
      id: 'usr_cust_2',
      name: 'Chloe Davis',
      email: 'chloe@example.com',
      passwordHash: defaultPasswordHash,
      role: 'customer',
      phone: '+1 (555) 678-9012',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    [admin, provider1, provider2, provider3, customer1, customer2].forEach(u => this.users.set(u.id, u));

    // 2. Services
    const service1: Service = {
      id: 'srv_1',
      name: 'Comprehensive Health & Biomarker Consultation',
      description: 'Full medical intake, biometric risk assessment, personalized metabolic nutrition advice, and preventive health plan with Dr. Vance.',
      category: 'Healthcare',
      durationMinutes: 45,
      price: 150,
      capacityPerSlot: 1, // 1-on-1 private
      providerId: provider1.id,
      providerName: provider1.name,
      cancellationWindowHours: 4, // 4 hours cancellation window
      operatingHours: {
        start: '09:00',
        end: '17:00',
        slotIntervalMinutes: 60,
      },
      availableDays: [1, 2, 3, 4, 5], // Mon - Fri
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
      location: 'Suite 402, Apex Medical Tower & Virtual Telehealth',
      createdAt: new Date().toISOString(),
    };

    const service2: Service = {
      id: 'srv_2',
      name: 'Sports Physiotherapy & Mobility Rehabilitation',
      description: 'Hands-on musculoskeletal therapy, targeted trigger point relief, biomechanical evaluation, and corrective movement programming.',
      category: 'Therapy & Rehab',
      durationMinutes: 60,
      price: 120,
      capacityPerSlot: 1,
      providerId: provider2.id,
      providerName: provider2.name,
      cancellationWindowHours: 2, // 2 hours window
      operatingHours: {
        start: '08:00',
        end: '18:00',
        slotIntervalMinutes: 60,
      },
      availableDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
      location: 'Kinetics Performance Lab, Studio B',
      createdAt: new Date().toISOString(),
    };

    const service3: Service = {
      id: 'srv_3',
      name: 'Small-Group High-Intensity Mobility Class',
      description: 'High-energy guided mobility and functional strength session with personalized form cues. Up to 4 participants per time slot.',
      category: 'Fitness & Group',
      durationMinutes: 45,
      price: 45,
      capacityPerSlot: 4, // Group capacity of 4
      providerId: provider2.id,
      providerName: provider2.name,
      cancellationWindowHours: 3,
      operatingHours: {
        start: '07:00',
        end: '11:00',
        slotIntervalMinutes: 60,
      },
      availableDays: [1, 2, 3, 4, 5, 6],
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
      location: 'Main Turf Arena, Floor 1',
      createdAt: new Date().toISOString(),
    };

    const service4: Service = {
      id: 'srv_4',
      name: 'Executive Business & Growth Strategy Session',
      description: 'Confidential 1-on-1 financial advisory, M&A prep, cash flow optimization, and strategic tax planning for founders and leadership.',
      category: 'Consulting',
      durationMinutes: 60,
      price: 220,
      capacityPerSlot: 1,
      providerId: provider3.id,
      providerName: provider3.name,
      cancellationWindowHours: 6,
      operatingHours: {
        start: '10:00',
        end: '16:00',
        slotIntervalMinutes: 60,
      },
      availableDays: [1, 2, 3, 4, 5],
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
      location: 'Private Boardroom & Zoom Teleconference',
      createdAt: new Date().toISOString(),
    };

    [service1, service2, service3, service4].forEach(s => this.services.set(s.id, s));

    // 3. Pre-seed initial bookings across today and upcoming days
    const today = new Date();
    const todayStr = this.formatDate(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = this.formatDate(tomorrow);

    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = this.formatDate(dayAfter);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDate(yesterday);

    const seedBookings: Booking[] = [
      {
        id: 'bkg_1',
        bookingReference: 'SB-8041',
        userId: customer1.id,
        customerName: customer1.name,
        customerEmail: customer1.email,
        customerPhone: customer1.phone,
        serviceId: service1.id,
        serviceName: service1.name,
        providerId: provider1.id,
        providerName: provider1.name,
        date: tomorrowStr,
        timeSlot: '10:00',
        durationMinutes: service1.durationMinutes,
        price: service1.price,
        status: 'confirmed',
        notes: 'Follow-up on recent lipid blood panel and endurance training plan.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'bkg_2',
        bookingReference: 'SB-8042',
        userId: customer1.id,
        customerName: customer1.name,
        customerEmail: customer1.email,
        customerPhone: customer1.phone,
        serviceId: service2.id,
        serviceName: service2.name,
        providerId: provider2.id,
        providerName: provider2.name,
        date: dayAfterStr,
        timeSlot: '14:00',
        durationMinutes: service2.durationMinutes,
        price: service2.price,
        status: 'confirmed',
        notes: 'Mild right shoulder impingement after swimming practice.',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 'bkg_3',
        bookingReference: 'SB-8043',
        userId: customer2.id,
        customerName: customer2.name,
        customerEmail: customer2.email,
        customerPhone: customer2.phone,
        serviceId: service3.id,
        serviceName: service3.name,
        providerId: provider2.id,
        providerName: provider2.name,
        date: tomorrowStr,
        timeSlot: '08:00',
        durationMinutes: service3.durationMinutes,
        price: service3.price,
        status: 'confirmed',
        notes: 'First time joining the morning mobility circle.',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: 'bkg_4',
        bookingReference: 'SB-8040',
        userId: customer1.id,
        customerName: customer1.name,
        customerEmail: customer1.email,
        customerPhone: customer1.phone,
        serviceId: service4.id,
        serviceName: service4.name,
        providerId: provider3.id,
        providerName: provider3.name,
        date: yesterdayStr,
        timeSlot: '11:00',
        durationMinutes: service4.durationMinutes,
        price: service4.price,
        status: 'completed',
        notes: 'Annual portfolio rebalancing and tax strategy review.',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      },
      {
        id: 'bkg_5',
        bookingReference: 'SB-8039',
        userId: customer2.id,
        customerName: customer2.name,
        customerEmail: customer2.email,
        customerPhone: customer2.phone,
        serviceId: service1.id,
        serviceName: service1.name,
        providerId: provider1.id,
        providerName: provider1.name,
        date: todayStr,
        timeSlot: '15:00',
        durationMinutes: service1.durationMinutes,
        price: service1.price,
        status: 'cancelled',
        notes: 'Initial checkup session.',
        cancelReason: 'Client rescheduled due to unexpected flight delay.',
        cancelledAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        cancelledBy: customer2.id,
        createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      }
    ];

    seedBookings.forEach(b => this.bookings.set(b.id, b));
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ================= USER METHODS =================
  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public findUserByEmail(email: string): User | undefined {
    const cleanEmail = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return user;
      }
    }
    return undefined;
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser: User = {
      ...userData,
      id,
      email: userData.email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // ================= SERVICE METHODS =================
  public getAllServices(includeInactive = false): Service[] {
    const all = Array.from(this.services.values());
    if (includeInactive) return all;
    return all.filter(s => s.isActive);
  }

  public findServiceById(id: string): Service | undefined {
    return this.services.get(id);
  }

  public createService(data: Omit<Service, 'id' | 'createdAt'>): Service {
    const id = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newService: Service = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.services.set(id, newService);
    return newService;
  }

  public updateService(id: string, updates: Partial<Omit<Service, 'id' | 'createdAt'>>): Service | undefined {
    const existing = this.services.get(id);
    if (!existing) return undefined;
    const updated: Service = { ...existing, ...updates };
    this.services.set(id, updated);
    return updated;
  }

  public deleteService(id: string): boolean {
    return this.services.delete(id);
  }

  // ================= AVAILABILITY & TIME SLOTS =================
  public getAvailableSlots(serviceId: string, dateStr: string): { 
    service: Service; 
    date: string; 
    dayOfWeek: number; 
    isOperatingDay: boolean; 
    slots: TimeSlotAvailability[];
  } {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    const targetDate = new Date(`${dateStr}T00:00:00`);
    const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon...
    const isOperatingDay = service.availableDays.includes(dayOfWeek);

    if (!isOperatingDay) {
      return {
        service,
        date: dateStr,
        dayOfWeek,
        isOperatingDay: false,
        slots: []
      };
    }

    // Generate intervals between operating hours
    const { start, end, slotIntervalMinutes } = service.operatingHours;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startTotalMin = startH * 60 + startM;
    const endTotalMin = endH * 60 + endM;

    // Get active confirmed bookings for this service and date
    const activeBookings = Array.from(this.bookings.values()).filter(b => 
      b.serviceId === serviceId && 
      b.date === dateStr && 
      b.status === 'confirmed'
    );

    // Current timestamp check to prevent past slots on today
    const now = new Date();
    const todayStr = this.formatDate(now);
    const isToday = dateStr === todayStr;
    const currentMinToday = now.getHours() * 60 + now.getMinutes();

    const slots: TimeSlotAvailability[] = [];

    for (let m = startTotalMin; m < endTotalMin; m += slotIntervalMinutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

      // Check how many confirmed bookings already exist for this slot
      const bookedCount = activeBookings.filter(b => b.timeSlot === timeStr).length;
      const remainingCapacity = Math.max(0, service.capacityPerSlot - bookedCount);

      // Check if slot has already passed in real-time
      const isPast = isToday && (m <= currentMinToday + 15); // 15 min buffer

      slots.push({
        time: timeStr,
        totalCapacity: service.capacityPerSlot,
        bookedCount,
        remainingCapacity,
        isAvailable: remainingCapacity > 0 && !isPast,
        isPast,
      });
    }

    return {
      service,
      date: dateStr,
      dayOfWeek,
      isOperatingDay: true,
      slots
    };
  }

  // ================= CONCURRENCY-SAFE BOOKING =================
  public createBooking(bookingData: {
    userId: string;
    serviceId: string;
    date: string;
    timeSlot: string;
    notes?: string;
    customCustomerName?: string;
    customCustomerEmail?: string;
    customCustomerPhone?: string;
  }): Booking {
    const service = this.services.get(bookingData.serviceId);
    if (!service) {
      throw new Error('Selected service not found.');
    }

    if (!service.isActive) {
      throw new Error('This service is currently not accepting bookings.');
    }

    const user = this.users.get(bookingData.userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // Critical: Mutual Exclusion Lock to prevent concurrent double-booking race conditions
    const lockKey = `${bookingData.serviceId}:${bookingData.date}:${bookingData.timeSlot}`;
    if (this.mutexLocks.has(lockKey)) {
      throw new Error('Another booking transaction is currently in progress for this slot. Please retry in a moment.');
    }

    try {
      this.mutexLocks.add(lockKey);

      // 1. Verify operating day
      const targetDate = new Date(`${bookingData.date}T00:00:00`);
      if (!service.availableDays.includes(targetDate.getDay())) {
        throw new Error('The service provider is not scheduled to work on this day of the week.');
      }

      // 2. Count existing confirmed bookings for this exact slot
      const existingConfirmed = Array.from(this.bookings.values()).filter(b =>
        b.serviceId === bookingData.serviceId &&
        b.date === bookingData.date &&
        b.timeSlot === bookingData.timeSlot &&
        b.status === 'confirmed'
      );

      if (existingConfirmed.length >= service.capacityPerSlot) {
        throw new Error(`Double-booking prevented: Time slot ${bookingData.timeSlot} on ${bookingData.date} is already fully booked (${existingConfirmed.length}/${service.capacityPerSlot} capacity).`);
      }

      // 3. Verify user does not already have a confirmed booking at the exact same time
      const userConflictingBooking = Array.from(this.bookings.values()).find(b =>
        b.userId === bookingData.userId &&
        b.date === bookingData.date &&
        b.timeSlot === bookingData.timeSlot &&
        b.status === 'confirmed'
      );

      if (userConflictingBooking) {
        throw new Error('You already hold a confirmed appointment for this exact date and time.');
      }

      // 4. Generate human-readable booking reference (e.g. SB-3829)
      const refNumber = Math.floor(1000 + Math.random() * 9000);
      const bookingReference = `SB-${refNumber}`;

      const id = `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const nowIso = new Date().toISOString();

      const newBooking: Booking = {
        id,
        bookingReference,
        userId: user.id,
        customerName: bookingData.customCustomerName || user.name,
        customerEmail: bookingData.customCustomerEmail || user.email,
        customerPhone: bookingData.customCustomerPhone || user.phone,
        serviceId: service.id,
        serviceName: service.name,
        providerId: service.providerId,
        providerName: service.providerName,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        durationMinutes: service.durationMinutes,
        price: service.price,
        status: 'confirmed',
        notes: bookingData.notes?.trim() || '',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      this.bookings.set(id, newBooking);
      return newBooking;
    } finally {
      this.mutexLocks.delete(lockKey);
    }
  }

  // ================= CANCELLATION LOGIC WITH POLICY ENFORCEMENT =================
  public cancelBooking(bookingId: string, requestedByUserId: string, reason?: string, bypassPolicy = false): {
    booking: Booking;
    message: string;
  } {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking #${bookingId} not found.`);
    }

    if (booking.status === 'cancelled') {
      throw new Error('This booking has already been cancelled.');
    }

    if (booking.status === 'completed') {
      throw new Error('Completed appointments cannot be cancelled.');
    }

    const requestingUser = this.users.get(requestedByUserId);
    if (!requestingUser) {
      throw new Error('Requesting user not recognized.');
    }

    const service = this.services.get(booking.serviceId);
    const cancellationWindowHours = service?.cancellationWindowHours ?? 2;

    // Check permissions
    const isOwner = booking.userId === requestedByUserId;
    const isProvider = booking.providerId === requestedByUserId;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isProvider && !isAdmin) {
      throw new Error('You do not have permission to cancel this appointment.');
    }

    // Customers must obey the service's cancellation window limit
    if (isOwner && !isAdmin && !isProvider && !bypassPolicy) {
      const appointmentDateTime = new Date(`${booking.date}T${booking.timeSlot}:00`);
      const now = new Date();
      const diffMs = appointmentDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < cancellationWindowHours) {
        const readableLimit = cancellationWindowHours === 1 ? '1 hour' : `${cancellationWindowHours} hours`;
        const readableRemaining = diffHours > 0 ? `${diffHours.toFixed(1)} hours` : '0 minutes';
        throw new Error(
          `Cancellation window expired: According to the service policy, appointments must be cancelled at least ${readableLimit} in advance. Time remaining: ${readableRemaining}. Please contact your provider or support directly.`
        );
      }
    }

    const nowIso = new Date().toISOString();
    booking.status = 'cancelled';
    booking.cancelReason = reason || (isOwner ? 'Cancelled by customer' : `Cancelled by ${requestingUser.role}`);
    booking.cancelledAt = nowIso;
    booking.cancelledBy = requestedByUserId;
    booking.updatedAt = nowIso;

    this.bookings.set(bookingId, booking);

    return {
      booking,
      message: 'Booking cancelled successfully. Slot availability has been instantly restored.',
    };
  }

  // ================= BOOKING STATUS UPDATES =================
  public updateBookingStatus(bookingId: string, status: BookingStatus): Booking {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking #${bookingId} not found.`);
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    this.bookings.set(bookingId, booking);
    return booking;
  }

  // ================= QUERY BOOKINGS =================
  public getAllBookings(): Booking[] {
    return Array.from(this.bookings.values()).sort((a, b) => 
      new Date(`${b.date}T${b.timeSlot}`).getTime() - new Date(`${a.date}T${a.timeSlot}`).getTime()
    );
  }

  public getBookingsByUser(userId: string): Booking[] {
    return Array.from(this.bookings.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(`${b.date}T${b.timeSlot}`).getTime() - new Date(`${a.date}T${a.timeSlot}`).getTime());
  }

  public getBookingsByProvider(providerId: string): Booking[] {
    return Array.from(this.bookings.values())
      .filter(b => b.providerId === providerId)
      .sort((a, b) => new Date(`${b.date}T${b.timeSlot}`).getTime() - new Date(`${a.date}T${a.timeSlot}`).getTime());
  }

  public findBookingById(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  // ================= ANALYTICS & STATS =================
  public getSystemMetrics() {
    const allBookings = Array.from(this.bookings.values());
    const confirmed = allBookings.filter(b => b.status === 'confirmed');
    const completed = allBookings.filter(b => b.status === 'completed');
    const cancelled = allBookings.filter(b => b.status === 'cancelled');

    const totalRevenue = confirmed.reduce((sum, b) => sum + b.price, 0) + 
                         completed.reduce((sum, b) => sum + b.price, 0);

    return {
      totalBookings: allBookings.length,
      confirmedCount: confirmed.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      activeServicesCount: Array.from(this.services.values()).filter(s => s.isActive).length,
      totalCustomers: Array.from(this.users.values()).filter(u => u.role === 'customer').length,
      totalRevenue,
    };
  }
}

export const db = new DatabaseStore();
