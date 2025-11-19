import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UserPayload } from '../interfaces/jwt.interface';
import { parse } from 'cookie';
import { Env } from 'src/config/env.validation';

export const validateWsHandshake = (
  client: Socket,
  jwtService: JwtService,
  configService: ConfigService<Env, true>,
): UserPayload | null => {
  try {
    const cookieHeader = client.handshake?.headers?.cookie || '';
    const cookies = parse(cookieHeader);

    const accessToken = cookies['access_token'];
    const xsrfToken = cookies['XSRF-TOKEN'];

    if (!accessToken || !xsrfToken) {
      return null;
    }

    const payload = jwtService.verify<UserPayload>(accessToken, {
      secret: configService.get('JWT_ACCESS_SECRET'),
    });

    if (payload.xsrf !== xsrfToken) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
