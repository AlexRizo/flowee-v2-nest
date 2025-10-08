import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'crypto';
import { Request } from 'express';

export const generateCSRFToken = (): string => {
  return randomBytes(32).toString('hex');
};

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const method = req.method.toUpperCase();

    const protectedMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

    if (!protectedMethods.has(method)) return true;

    const cookieToken = (req.cookies?.['XSRF-TOKEN'] ?? '') as string;

    const headerToken = (req.header('x-xsrf-token') ??
      req.header('x-csrf-token')) as string;

    if (!cookieToken && !headerToken) return false;

    try {
      const cookieTkn = Buffer.from(cookieToken);
      const headerTkn = Buffer.from(headerToken);

      return (
        cookieTkn.length === headerTkn.length &&
        timingSafeEqual(cookieTkn, headerTkn)
      );
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
