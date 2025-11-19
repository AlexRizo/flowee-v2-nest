import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { TaskWsService } from './task-ws.service';
import { Server, Socket } from 'socket.io';
import { validateWsHandshake } from 'src/auth/utils/validateWsHandshake';
import { JwtService } from '@nestjs/jwt';
import { Env } from 'src/config/env.validation';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway()
export class TaskWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly taskWsService: TaskWsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const payload = validateWsHandshake(
      client,
      this.jwtService,
      this.configService,
    );

    if (!payload) {
      client.disconnect();
      return;
    }

    await this.taskWsService.registerClient(client, payload.id);

    const clients = this.taskWsService.getConnectedClients();

    console.log(
      'Clients connected:',
      Array.from(Object.values(clients)).map(c => c.user.email),
    );
  }

  handleDisconnect(client: Socket) {
    this.taskWsService.removeClient(client.id);
  }
}
