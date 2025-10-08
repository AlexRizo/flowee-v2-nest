import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role.decorator';
import { Request } from 'express';
import { UserPayload } from '../interfaces/jwt.interface';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: Role[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles || !validRoles.length) return true;

    const req: Request = context.switchToHttp().getRequest();

    const user = req.user as UserPayload;

    for (const role of validRoles) {
      if (user.role === role) return true;
    }

    throw new ForbiddenException('Usuario no autorizado');
  }
}
