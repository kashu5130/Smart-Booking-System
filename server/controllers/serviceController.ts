import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const serviceController = {
  // List all services (supports filtering by category, search query, or includeInactive)
  async getAllServices(req: AuthenticatedRequest, res: Response) {
    try {
      const { category, search, includeInactive } = req.query;
      const isAdminOrProvider = req.user && (req.user.role === 'admin' || req.user.role === 'provider');
      const shouldIncludeInactive = isAdminOrProvider && includeInactive === 'true';

      let services = db.getAllServices(shouldIncludeInactive);

      if (category && typeof category === 'string' && category !== 'All') {
        services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
      }

      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        services = services.filter(s => 
          s.name.toLowerCase().includes(query) || 
          s.description.toLowerCase().includes(query) ||
          s.providerName.toLowerCase().includes(query)
        );
      }

      return res.json({
        success: true,
        count: services.length,
        services,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get single service by ID
  async getServiceById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const service = db.findServiceById(id);

      if (!service) {
        return res.status(404).json({ success: false, error: 'Service not found.' });
      }

      return res.json({ success: true, service });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get real-time available time slots for a specific service and date
  async getAvailableSlots(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { date } = req.query;

      if (!date || typeof date !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query parameter "date" (YYYY-MM-DD) is required.',
        });
      }

      // Validate date format YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Expected YYYY-MM-DD.',
        });
      }

      const availability = db.getAvailableSlots(id, date);

      return res.json({
        success: true,
        ...availability,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  // Create a new service (Admin or Provider)
  async createService(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'provider')) {
        return res.status(403).json({ success: false, error: 'Unauthorized to create services.' });
      }

      const {
        name,
        description,
        category,
        durationMinutes,
        price,
        capacityPerSlot = 1,
        providerId,
        cancellationWindowHours = 2,
        operatingHours,
        availableDays,
        imageUrl,
        location,
      } = req.body;

      if (!name || !description || !category || !durationMinutes || price === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Name, description, category, durationMinutes, and price are required.',
        });
      }

      // If provider creates, providerId is their own. If admin creates, they can specify providerId.
      let assignedProviderId = req.user.userId;
      let assignedProviderName = req.user.name;

      if (req.user.role === 'admin' && providerId) {
        const targetProvider = db.findUserById(providerId);
        if (targetProvider) {
          assignedProviderId = targetProvider.id;
          assignedProviderName = targetProvider.name;
        }
      }

      const newService = db.createService({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        capacityPerSlot: Number(capacityPerSlot) || 1,
        providerId: assignedProviderId,
        providerName: assignedProviderName,
        cancellationWindowHours: Number(cancellationWindowHours) || 2,
        operatingHours: operatingHours || {
          start: '09:00',
          end: '17:00',
          slotIntervalMinutes: Number(durationMinutes) <= 45 ? 30 : 60,
        },
        availableDays: availableDays || [1, 2, 3, 4, 5],
        isActive: true,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
        location: location || 'Main Headquarters & Online',
      });

      return res.status(201).json({
        success: true,
        message: 'Service created successfully.',
        service: newService,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update existing service
  async updateService(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const existing = db.findServiceById(id);

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Service not found.' });
      }

      // Check ownership or admin
      if (req.user?.role !== 'admin' && req.user?.userId !== existing.providerId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to edit this service.',
        });
      }

      const updated = db.updateService(id, req.body);

      return res.json({
        success: true,
        message: 'Service updated successfully.',
        service: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Delete/Deactivate service
  async deleteService(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const existing = db.findServiceById(id);

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Service not found.' });
      }

      if (req.user?.role !== 'admin' && req.user?.userId !== existing.providerId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to delete this service.',
        });
      }

      db.deleteService(id);

      return res.json({
        success: true,
        message: 'Service deleted successfully.',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
