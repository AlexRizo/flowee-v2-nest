import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { TaskWsService } from './task-ws.service';
import { Server } from 'socket.io';
import { validateWsHandshake } from 'src/auth/utils/validateWsHandshake';
import { JwtService } from '@nestjs/jwt';
import { Env } from 'src/config/env.validation';
import { ConfigService } from '@nestjs/config';
import { JoinUserBoardDto } from './dto/join-user-board.dto';
import { UpdateTaskWsStatusDto } from './dto/update-task-ws-status.dto';
import { type AuthSocket } from './interfaces/task-ws.interface';
import { WsAuth } from 'src/auth/decorators/ws-auth.decorator';

@WsAuth()
@WebSocketGateway()
export class TaskWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly taskWsService: TaskWsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: AuthSocket) {
    const payload = validateWsHandshake(
      client,
      this.jwtService,
      this.configService,
    );

    if (!payload) {
      client.disconnect();
      this.taskWsService.sendExceptionMessage(client, 'No estás autorizado');
      return;
    }

    await this.taskWsService.registerClient(client, payload.id);
  }

  handleDisconnect(client: AuthSocket) {
    this.taskWsService.removeClient(client.userId);
  }

  @SubscribeMessage('join-board')
  async joinBoard(client: AuthSocket, { boardId }: JoinUserBoardDto) {
    await this.taskWsService.joinUserToBoard(client, boardId);
  }

  @SubscribeMessage('move-task-status')
  async updateTaskStatus(client: AuthSocket, payload: UpdateTaskWsStatusDto) {
    await this.taskWsService.updateTaskStatus(client, payload);
  }
}
