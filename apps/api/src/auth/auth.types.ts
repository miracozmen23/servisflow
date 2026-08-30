import type { UserRole } from '../generated/prisma/client';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthContext {
  sessionId: string;
  user: AuthUser;
}

export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}

export interface AuthResult {
  expiresAt: Date;
  sessionToken: string;
  user: AuthUser;
}
