import { SetMetadata } from '@nestjs/common';
import { Role as PrismaRoles } from '@prisma/client';

export const WS_ROLE_KEY = 'wsRole';

export const WsRoles = (...roles: PrismaRoles[]) =>
  SetMetadata(WS_ROLE_KEY, roles);
