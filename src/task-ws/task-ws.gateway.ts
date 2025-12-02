import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  WsException,
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
import { Logger } from '@nestjs/common';
import { AssignTaskDto } from 'src/boards/dto/assign-task.dto';

@WsAuth()
@WebSocketGateway()
export class TaskWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TaskWsGateway.name);

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
      return;
    }

    client.userId = payload.id;

    const personalRoom = this.getUserRoom(payload.id);

    await client.join(personalRoom);
  }

  handleDisconnect() {}

  @SubscribeMessage('join-board')
  async joinBoard(client: AuthSocket, { boardId }: JoinUserBoardDto) {
    try {
      const isAdmin = await this.taskWsService.validateJoinBoard(client.userId);

      if (isAdmin) {
        const adminRoom = this.getAdminBoardRoom(boardId);
        await client.join(adminRoom);
      }

      const isMember = await this.taskWsService.userIsBoardMember(
        boardId,
        client.userId,
      );

      if (!isAdmin && !isMember) {
        const message = 'No tienes permiso para unirte a este tablero';

        this.sendExceptionMessage(client, {
          message,
        });
        throw new WsException(message);
      }

      const boardRoom = this.getBoardRoom(boardId);
      await client.join(boardRoom);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('assign-task')
  async assignTask(client: AuthSocket, { taskId, userId }: AssignTaskDto) {
    try {
      const { task, oldAssigneeId, newAssigneeId } =
        await this.taskWsService.assignTask({ taskId, userId });

      if (oldAssigneeId) {
        client.to(this.getUserRoom(oldAssigneeId)).emit('notification', {
          message: 'Una de tus tareas ha sido reasignada',
        });
      }

      client.to(this.getUserRoom(newAssigneeId)).emit('notification', {
        message: 'Se te ha asignado una nueva tarea',
      });

      client.to(this.getBoardRoom(task.boardId)).emit('task-assigned', {
        task,
      });
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('move-task-status')
  async updateTaskStatus(client: AuthSocket, payload: UpdateTaskWsStatusDto) {
    try {
      const { task, fromStatus, toStatus } =
        await this.taskWsService.updateTaskStatus(payload);

      if (task.assignedToId) {
        client.to(this.getUserRoom(task.assignedToId)).emit('notification', {
          message: 'Una de tus tareas ha sido actualizada',
        });
      }

      client.to(this.getBoardRoom(task.boardId)).emit('task-status-updated', {
        taskId: task.id,
        fromStatus,
        toStatus,
      });
    } catch (error) {
      this.handleError(client, error);
    }
  }

  //* =================================================================
  //* 4. HELPERS PRIVADOS
  //* =================================================================

  private getAdminBoardRoom(boardId: string) {
    return `admin:board-${boardId}`;
  }

  private getBoardRoom(boardId: string) {
    return `board-${boardId}`;
  }

  private getUserRoom(userId: string) {
    return `user-${userId}`;
  }

  private userIsInBoardRoom(client: AuthSocket, boardId: string) {
    return client.rooms.has(this.getBoardRoom(boardId));
  }

  private sendNotification(client: AuthSocket, payload: { message: string }) {
    client.emit('notification', payload);
  }

  private sendExceptionMessage(
    client: AuthSocket,
    payload: { message: string },
  ) {
    client.emit('exception-message', payload);
  }

  private handleError(client: AuthSocket, error: any) {
    this.logger.error(error);
    client.emit('exception', {
      message: (error as Error).message || 'Error desconocido',
    });
  }
}
