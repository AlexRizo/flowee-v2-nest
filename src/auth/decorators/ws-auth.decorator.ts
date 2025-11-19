import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role as PrismaRoles } from '@prisma/client';
import { WsAuthGuard } from '../guards/ws-auth.guard';
import { WsRolesGuard } from '../guards/ws-roles.guard';
import { WsRoles } from './ws-roles.decorator';

export const WsAuth = (...roles: PrismaRoles[]) => {
  // Si no se pasan roles → solo autenticación
  if (!roles || roles.length === 0) {
    return applyDecorators(UseGuards(WsAuthGuard));
  }

  // Si se pasan roles → aplica roles + guards
  return applyDecorators(
    WsRoles(...roles),
    UseGuards(WsAuthGuard, WsRolesGuard),
  );
};
