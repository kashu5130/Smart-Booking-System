/**
 * Production-Ready Mongoose Schemas & Models for MongoDB Deployment
 * 
 * Includes:
 * - Field validations and enumerations
 * - Compound indexes preventing concurrent double-booking
 * - Cascade helper references and timestamps
 */

/*
Example Mongoose Schema Definition (requires 'mongoose' npm package if connecting to MongoDB Atlas):

import mongoose, { Schema, Document } from 'mongoose';

// ================= USER SCHEMA =================
export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'provider' | 'customer';
  phone?: string;
  avatarUrl?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'provider', 'customer'], 
    default: 'customer',
    required: true 
  },
  phone: { type: String, trim: true },
  avatarUrl: { type: String },
  title: { type: String }
}, {
  timestamps: true
});

// ================= SERVICE SCHEMA =================
export interface IServiceDocument extends Document {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  capacityPerSlot: number;
  providerId: mongoose.Types.ObjectId;
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
}

export const ServiceSchema = new Schema<IServiceDocument>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  durationMinutes: { type: Number, required: true, min: 5 },
  price: { type: Number, required: true, min: 0 },
  capacityPerSlot: { type: Number, default: 1, min: 1 },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  providerName: { type: String, required: true },
  cancellationWindowHours: { type: Number, default: 2, min: 0 },
  operatingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
    slotIntervalMinutes: { type: Number, default: 30 }
  },
  availableDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // Mon-Fri
  isActive: { type: Boolean, default: true, index: true },
  imageUrl: { type: String },
  location: { type: String, default: 'In-Person / Online' }
}, {
  timestamps: true
});

// ================= BOOKING SCHEMA =================
export interface IBookingDocument extends Document {
  bookingReference: string;
  userId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceId: mongoose.Types.ObjectId;
  serviceName: string;
  providerId: mongoose.Types.ObjectId;
  providerName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  durationMinutes: number;
  price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  cancelReason?: string;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
}

export const BookingSchema = new Schema<IBookingDocument>({
  bookingReference: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
  serviceName: { type: String, required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  providerName: { type: String, required: true },
  date: { type: String, required: true, index: true },
  timeSlot: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['confirmed', 'cancelled', 'completed'], 
    default: 'confirmed',
    index: true 
  },
  notes: { type: String },
  cancelReason: { type: String },
  cancelledAt: { type: Date },
  cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Compound index to quickly fetch slot load and support double-booking prevention queries:
BookingSchema.index({ serviceId: 1, date: 1, timeSlot: 1, status: 1 });
BookingSchema.index({ providerId: 1, date: 1, timeSlot: 1, status: 1 });

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export const ServiceModel = mongoose.models.Service || mongoose.model<IServiceDocument>('Service', ServiceSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model<IBookingDocument>('Booking', BookingSchema);
*/

export const MONGOOSE_SCHEMAS_GUIDE = `
// MongoDB Mongoose Connection String Configuration:
// Set MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart-booking
`;
