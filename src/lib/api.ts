import { User, Service, Booking, TimeSlotAvailability, SystemMetrics } from '../types.ts';

const TOKEN_KEY = 'smart_booking_jwt_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Failed request`);
    }

    return data as T;
  },

  // Auth endpoints
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'customer' | 'provider';
    phone?: string;
  }): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(res.token);
    return res;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return this.request<{ success: boolean; user: User }>('/api/auth/me');
  },

  async switchPersona(personaId: string): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/api/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ personaId }),
    });
    this.setToken(res.token);
    return res;
  },

  async getProviders(): Promise<{ success: boolean; providers: User[] }> {
    return this.request<{ success: boolean; providers: User[] }>('/api/auth/providers');
  },

  // Services endpoints
  async getServices(params?: { category?: string; search?: string; includeInactive?: boolean }): Promise<{
    success: boolean;
    count: number;
    services: Service[];
  }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.includeInactive) query.append('includeInactive', 'true');

    const url = `/api/services${query.toString() ? `?${query.toString()}` : ''}`;
    return this.request(url);
  },

  async getServiceById(id: string): Promise<{ success: boolean; service: Service }> {
    return this.request(`/api/services/${id}`);
  },

  async getServiceSlots(serviceId: string, date: string): Promise<{
    success: boolean;
    service: Service;
    date: string;
    dayOfWeek: number;
    isOperatingDay: boolean;
    slots: TimeSlotAvailability[];
  }> {
    return this.request(`/api/services/${serviceId}/slots?date=${encodeURIComponent(date)}`);
  },

  async createService(serviceData: Partial<Service>): Promise<{ success: boolean; service: Service; message: string }> {
    return this.request('/api/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },

  async updateService(id: string, updates: Partial<Service>): Promise<{ success: boolean; service: Service; message: string }> {
    return this.request(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/services/${id}`, {
      method: 'DELETE',
    });
  },

  // Bookings endpoints
  async createBooking(bookingData: {
    serviceId: string;
    date: string;
    timeSlot: string;
    notes?: string;
    customCustomerName?: string;
    customCustomerEmail?: string;
    customCustomerPhone?: string;
  }): Promise<{ success: boolean; booking: Booking; message: string }> {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async getMyBookings(): Promise<{ success: boolean; count: number; bookings: Booking[] }> {
    return this.request('/api/bookings/my');
  },

  async getAllBookings(filters?: { status?: string; date?: string; serviceId?: string; providerId?: string }): Promise<{
    success: boolean;
    count: number;
    bookings: Booking[];
  }> {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.date) query.append('date', filters.date);
    if (filters?.serviceId) query.append('serviceId', filters.serviceId);
    if (filters?.providerId) query.append('providerId', filters.providerId);

    const url = `/api/bookings${query.toString() ? `?${query.toString()}` : ''}`;
    return this.request(url);
  },

  async cancelBooking(id: string, reason?: string, bypassPolicy = false): Promise<{
    success: boolean;
    booking: Booking;
    message: string;
  }> {
    return this.request(`/api/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, bypassPolicy }),
    });
  },

  async updateBookingStatus(id: string, status: string): Promise<{
    success: boolean;
    booking: Booking;
    message: string;
  }> {
    return this.request(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Metrics & Utilities
  async getMetrics(): Promise<{ success: boolean; metrics: SystemMetrics }> {
    return this.request('/api/metrics');
  },

  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    return this.request('/api/system/reset', {
      method: 'POST',
    });
  },
};
