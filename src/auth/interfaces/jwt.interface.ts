import { Role } from '@prisma/client';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: Role;
  refreshToken: string;
  xsrf: string;
  iat?: number;
  exp?: number;
}
