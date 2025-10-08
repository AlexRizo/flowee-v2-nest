import { Role } from '@prisma/client';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
