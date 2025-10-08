import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role as PrismaRoles } from '@prisma/client';
import { Role } from './role.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserRoleGuard } from '../guards/user-role.guard';

export const Auth = (...roles: PrismaRoles[]) => {
  return applyDecorators(
    Role(...roles),
    UseGuards(JwtAuthGuard, UserRoleGuard),
  );
};
