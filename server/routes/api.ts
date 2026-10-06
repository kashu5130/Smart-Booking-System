import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { serviceController } from '../controllers/serviceController.ts';
import { bookingController } from '../controllers/bookingController.ts';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.ts';

const router = Router();

// ================= AUTHENTICATION ROUTES =================
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/demo', authController.demoLogin);
router.get('/auth/me', authenticate, authController.getCurrentUser);
router.get('/auth/providers', optionalAuthenticate, authController.getProviders);

// ================= SERVICE ROUTES =================
// Public / authenticated service browsing
router.get('/services', optionalAuthenticate, serviceController.getAllServices);
router.get('/services/:id', optionalAuthenticate, serviceController.getServiceById);

// Real-time slot availability for any date
router.get('/services/:id/slots', optionalAuthenticate, serviceController.getAvailableSlots);

// Admin / Provider service management
router.post('/services', authenticate, requireRole('admin', 'provider'), serviceController.createService);
router.put('/services/:id', authenticate, requireRole('admin', 'provider'), serviceController.updateService);
router.delete('/services/:id', authenticate, requireRole('admin', 'provider'), serviceController.deleteService);

// ================= BOOKING ROUTES =================
// Customer creates booking (concurrency safe)
router.post('/bookings', authenticate, bookingController.createBooking);

// User's own bookings
router.get('/bookings/my', authenticate, bookingController.getMyBookings);

// Admin / Provider booking dashboard
router.get('/bookings', authenticate, requireRole('admin', 'provider'), bookingController.getAllBookings);

// Booking cancellation (with policy checks)
router.post('/bookings/:id/cancel', authenticate, bookingController.cancelBooking);

// Provider/Admin status update (e.g. marked completed)
router.patch('/bookings/:id/status', authenticate, requireRole('admin', 'provider'), bookingController.updateStatus);

// ================= SYSTEM METRICS & UTILITIES =================
router.get('/metrics', authenticate, requireRole('admin', 'provider'), bookingController.getMetrics);
router.post('/system/reset', authenticate, requireRole('admin'), bookingController.resetDemoData);

export default router;
