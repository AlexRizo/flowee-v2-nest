import { SetMetadata } from '@nestjs/common';
import { Role as PrismaRoles } from '@prisma/client';

export const META_ROLES = 'roles';

export const Role = (...args: PrismaRoles[]) => SetMetadata(META_ROLES, args);
