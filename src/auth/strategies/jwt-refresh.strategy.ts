import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayload } from '../interfaces/jwt.interface';

const refreshTokenExtractor = (req: Request) => {
  return (req?.cookies?.['refresh_token'] as string) ?? null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([refreshTokenExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET')!,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: UserPayload) {
    const token = refreshTokenExtractor(req);

    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      refreshToken: token,
    };
  }
}
