import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { BookingStatus } from '../types.ts';

export const bookingController = {
  // Create an appointment booking
  async createBooking(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required to book.' });
      }

      const {
        serviceId,
        date,
        timeSlot,
        notes,
        customCustomerName,
        customCustomerEmail,
        customCustomerPhone,
      } = req.body;

      if (!serviceId || !date || !timeSlot) {
        return res.status(400).json({
          success: false,
          error: 'serviceId, date (YYYY-MM-DD), and timeSlot (HH:mm) are required.',
        });
      }

      // Concurrency-safe booking creation with atomic capacity validation
      const booking = db.createBooking({
        userId: req.user.userId,
        serviceId,
        date,
        timeSlot,
        notes,
        customCustomerName,
        customCustomerEmail,
        customCustomerPhone,
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully!',
        booking,
      });
    } catch (error: any) {
      // Return 409 Conflict if double-booking or capacity limit hit
      const isConflict = error.message?.includes('Double-booking') || error.message?.includes('capacity');
      return res.status(isConflict ? 409 : 400).json({
        success: false,
        error: error.message || 'Unable to complete appointment booking.',
      });
    }
  },

  // Get current user's bookings (Customer sees theirs, Provider sees their client bookings)
  async getMyBookings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }

      let bookings = [];
      if (req.user.role === 'customer') {
        bookings = db.getBookingsByUser(req.user.userId);
      } else if (req.user.role === 'provider') {
        bookings = db.getBookingsByProvider(req.user.userId);
      } else {
        // Admin sees all
        bookings = db.getAllBookings();
      }

      return res.json({
        success: true,
        count: bookings.length,
        bookings,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get all bookings (Admin/Provider dashboard) with filtering
  async getAllBookings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'provider')) {
        return res.status(403).json({ success: false, error: 'Dashboard access denied.' });
      }

      let bookings = db.getAllBookings();

      // If provider, limit to their services unless admin
      if (req.user.role === 'provider') {
        bookings = bookings.filter(b => b.providerId === req.user?.userId);
      }

      const { status, date, serviceId, providerId } = req.query;

      if (status && typeof status === 'string' && status !== 'all') {
        bookings = bookings.filter(b => b.status === status);
      }

      if (date && typeof date === 'string') {
        bookings = bookings.filter(b => b.date === date);
      }

      if (serviceId && typeof serviceId === 'string') {
        bookings = bookings.filter(b => b.serviceId === serviceId);
      }

      if (providerId && typeof providerId === 'string' && req.user.role === 'admin') {
        bookings = bookings.filter(b => b.providerId === providerId);
      }

      return res.json({
        success: true,
        count: bookings.length,
        bookings,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Cancel booking with policy enforcement
  async cancelBooking(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }

      const { id } = req.params;
      const { reason, bypassPolicy } = req.body;

      const result = db.cancelBooking(
        id,
        req.user.userId,
        reason,
        Boolean(bypassPolicy && req.user.role === 'admin')
      );

      return res.json({
        success: true,
        message: result.message,
        booking: result.booking,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to cancel booking.',
      });
    }
  },

  // Update booking status (Admin or Provider: completed, confirmed, etc.)
  async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'provider')) {
        return res.status(403).json({ success: false, error: 'Unauthorized.' });
      }

      const { id } = req.params;
      const { status } = req.body;

      const validStatuses: BookingStatus[] = ['confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const updated = db.updateBookingStatus(id, status);

      return res.json({
        success: true,
        message: `Booking status updated to ${status}.`,
        booking: updated,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get metrics and stats
  async getMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      const metrics = db.getSystemMetrics();
      return res.json({ success: true, metrics });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Reset demo database
  async resetDemoData(req: AuthenticatedRequest, res: Response) {
    try {
      db.seedDatabase();
      return res.json({
        success: true,
        message: 'Database has been restored to default sample records and operating schedules.',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
