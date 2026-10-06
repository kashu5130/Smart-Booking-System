import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.ts';
import { AuthenticatedRequest, generateToken } from '../middleware/auth.ts';
import { UserRole } from '../types.ts';

export const authController = {
  // Login with email & password
  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required.',
        });
      }

      const user = db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. User with this email does not exist.',
        });
      }

      const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password. Please check your credentials.',
        });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      const { passwordHash, ...safeUser } = user;
      return res.json({
        success: true,
        token,
        user: safeUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to authenticate user.',
      });
    }
  },

  // Register new account
  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, email, password, role = 'customer', phone, title } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and password are required fields.',
        });
      }

      const validRoles: UserRole[] = ['customer', 'provider', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role. Allowed roles: ${validRoles.join(', ')}`,
        });
      }

      const existingUser = db.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email address already exists.',
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newUser = db.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role,
        phone: phone?.trim(),
        title: title?.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      });

      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      });

      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: safeUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to register account.',
      });
    }
  },

  // Get current user profile
  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }

      const user = db.findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User profile not found.' });
      }

      const { passwordHash, ...safeUser } = user;
      return res.json({
        success: true,
        user: safeUser,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Instant Persona Switcher for demonstration
  async demoLogin(req: AuthenticatedRequest, res: Response) {
    try {
      const { personaId } = req.body; // 'admin', 'provider1', 'provider2', 'customer1', 'customer2'

      const personaMap: Record<string, string> = {
        admin: 'usr_admin',
        provider1: 'usr_prov_1',
        provider2: 'usr_prov_2',
        customer1: 'usr_cust_1',
        customer2: 'usr_cust_2',
      };

      const targetUserId = personaMap[personaId] || personaId;
      const user = db.findUserById(targetUserId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `Demo persona '${personaId}' not found.`,
        });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      const { passwordHash, ...safeUser } = user;
      return res.json({
        success: true,
        token,
        user: safeUser,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // List all providers (helpful for booking/scheduling & admin assignment)
  async getProviders(req: AuthenticatedRequest, res: Response) {
    try {
      const providers = db.getAllUsers()
        .filter(u => u.role === 'provider' || u.role === 'admin')
        .map(({ passwordHash, ...safe }) => safe);

      return res.json({ success: true, providers });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
