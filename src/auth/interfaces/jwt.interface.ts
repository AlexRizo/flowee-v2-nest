import { Role } from '@prisma/client';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: Role;
  refreshToken: string;
  iat?: number;
  exp?: number;
}
