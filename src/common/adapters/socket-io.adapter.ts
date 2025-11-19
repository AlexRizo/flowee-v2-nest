import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WebSocketServerOptions } from '@nestjs/websockets';
import { Env } from 'src/config/env.validation';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    private readonly app: INestApplication,
    private readonly configService: ConfigService<Env, true>,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: WebSocketServerOptions): any {
    const corsOrigin: string = this.configService.get('CORS_ORIGIN');

    const finalOptions = {
      ...options,
      cors: {
        origin: corsOrigin,
      },
    };

    return super.createIOServer(port, finalOptions);
  }
}
