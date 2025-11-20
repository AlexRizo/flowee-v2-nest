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
import { JoinUserBoardDto } from './dto/join-user-board.dto';
import { UpdateTaskWsStatusDto } from './dto/update-task-ws-status.dto';

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
      this.taskWsService.sendExceptionMessage(client, 'No estás autorizado');
      return;
    }

    await this.taskWsService.registerClient(client, payload.id);
  }

  handleDisconnect(client: Socket) {
    this.taskWsService.removeClient(client.id);
  }

  @SubscribeMessage('join-board')
  async joinBoard(client: Socket, { boardId }: JoinUserBoardDto) {
    await this.taskWsService.joinUserToBoard(client, boardId);
  }

  @SubscribeMessage('move-task-status')
  async updateTaskStatus(client: Socket, payload: UpdateTaskWsStatusDto) {
    await this.taskWsService.updateTaskStatus(client, payload, this.server);
  }
}
