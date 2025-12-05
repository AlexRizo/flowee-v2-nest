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
      client.emit('exception', { message: 'Unauthorized' });
      client.disconnect();
      return;
    }

    const { id, username, email, role } = payload;

    client.data.user = { username, email, role };
    client.userId = id;

    const personalRoom = this.getUserRoom(id);

    await client.join(personalRoom);
  }

  handleDisconnect(client: AuthSocket) {
    console.log(`cliente ${client.userId} desconectado`);
  }

  @SubscribeMessage('join-board')
  async joinBoard(client: AuthSocket, { boardId }: JoinUserBoardDto) {
    try {
      const isAdmin = await this.taskWsService.validateJoinBoard(client.userId);

      if (isAdmin) {
        const adminRoom = this.getAdminBoardRoom(boardId);
        await client.join(adminRoom);
      }
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

      client.to(this.getAdminBoardRoom(task.boardId)).emit('task-assigned', {
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

      const taskData = {
        taskId: task.id,
        fromStatus,
        toStatus,
      };

      const senderUserId = client.userId;

      const usersToEmit = new Set<string>();

      usersToEmit.add(task.authorId);
      if (task.assignedToId) {
        usersToEmit.add(task.assignedToId);
      }

      if (usersToEmit.has(senderUserId)) {
        usersToEmit.delete(senderUserId);
      }

      const usersToEmitArray = Array.from(usersToEmit).map(id =>
        this.getUserRoom(id),
      );

      if (usersToEmitArray.length > 0) {
        this.server.to(usersToEmitArray).emit('notification', {
          message: `La tarea ${task.title} ha sido movida de ${fromStatus} a ${toStatus}`,
        });
        this.server.to(usersToEmitArray).emit('task-moved', taskData);
      }

      client.broadcast
        .to(this.getAdminBoardRoom(task.boardId))
        .emit('task-moved', taskData);
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

  // private getBoardRoom(boardId: string) {
  //   return `board-${boardId}`;
  // }

  private getUserRoom(userId: string) {
    return `user-${userId}`;
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
