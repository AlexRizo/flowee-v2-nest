import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { TaskWsService } from './task-ws.service';
import { Server, Socket } from 'socket.io';
import { validateWsHandshake } from 'src/auth/utils/validateWsHandshake';
import { JwtService } from '@nestjs/jwt';
import { Env } from 'src/config/env.validation';
import { ConfigService } from '@nestjs/config';
import { UpdateBoardStatusDto } from './dto/update-board-status.dto';

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

    console.log(client.id + '-c');
  }

  handleDisconnect(client: Socket) {
    this.taskWsService.removeClient(client.id);

    console.log(client.id + '-d');
  }

  @SubscribeMessage('join-board')
  joinBoard(client: Socket, payload: UpdateBoardStatusDto) {
    this.taskWsService.joinUserToBoard(client, payload);
  }
}
