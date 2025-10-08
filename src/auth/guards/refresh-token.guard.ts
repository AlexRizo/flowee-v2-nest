import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from './interfaces/guard.interface';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = AuthUser>(
    err: any,
    user: any,
    info: Error & { message: string },
  ): TUser {
    if (err) throw err;

    if (!user) {
      const message = info?.message || 'El token no es válido';

      throw new UnauthorizedException(message);
    }

    return user as TUser;
  }
}
