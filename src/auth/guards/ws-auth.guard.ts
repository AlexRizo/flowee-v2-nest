import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { parse } from 'cookie';
import { Socket } from 'socket.io';
import { UserPayload } from '../interfaces/jwt.interface';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.validation';
import { WsClientData } from './interfaces/ws.interface';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}
  private readonly logger = new Logger(WsAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket<WsClientData>>();

    try {
      const cookieHeader = client.handshake.headers.cookie || '';
      const cookies = parse(cookieHeader);

      const accessToken = cookies['access_token'];
      const xsrfToken = cookies['XSRF-TOKEN'];

      if (!accessToken || !xsrfToken) {
        throw new WsException('Forbidden');
      }

      const payload = this.jwtService.verify<UserPayload>(accessToken, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      if (payload.xsrf !== xsrfToken) {
        throw new WsException('xsrf token does not match');
      }

      (client.data as WsClientData).user = payload;

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new WsException('Unauthorized');
      }

      this.logger.error(error);
      throw new WsException('Forbidden');
    }
  }
}
