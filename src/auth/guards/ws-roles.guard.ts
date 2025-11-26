import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { WS_ROLE_KEY } from '../decorators/ws-roles.decorator';
import { WsClientData } from './interfaces/ws.interface';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      WS_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const client = context.switchToWs().getClient<Socket<WsClientData>>();
    const user = (client.data as WsClientData).user;

    if (!user) {
      throw new WsException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new WsException('Usuario no autorizado');
    }

    return true;
  }
}
