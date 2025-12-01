import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { BoardsService } from 'src/boards/boards.service';
import { AuthSocket, ConnectedClients } from './interfaces/task-ws.interface';
import { UpdateTaskWsStatusDto } from './dto/update-task-ws-status.dto';
import { TasksService } from 'src/tasks/tasks.service';
import { WsException } from '@nestjs/websockets';
import { AssignTaskDto } from '../boards/dto/assign-task.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TaskWsService {
  private connectedClients: ConnectedClients = {};

  private readonly logger = new Logger(TaskWsService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
    private readonly taskService: TasksService,
  ) {}

  private adminBoardRoom(boardId: string) {
    return `board-${boardId}:admin`;
  }

  private userRoom(userId: string) {
    return `user-${userId}`;
  }

  getConnectedClients() {
    return this.connectedClients;
  }

  getConnectedClient(userId: string) {
    return this.connectedClients[userId];
  }

  async registerClient(client: AuthSocket, userId: string) {
    const user = await this.usersService.findOne(userId);

    client.userId = user.id;

    const isLoggedIn = this.connectedClients[user.id];

    if (isLoggedIn) {
      this.logoutWs(isLoggedIn.socket);
    }

    this.connectedClients[user.id] = {
      socket: client,
      user,
    };

    await client.join(this.userRoom(user.id));
  }

  removeClient(userId: string) {
    delete this.connectedClients[userId];
  }

  async joinUserToBoard(client: AuthSocket, boardId: string) {
    // const userIsInBoard = await this.boardsService.userIsInBoard(
    //   boardId,
    //   client.userId,
    // );

    const { user } = this.getConnectedClient(client.userId);

    const adminRoles: Role[] = [
      Role.ADMIN,
      Role.SUPER_ADMIN,
      Role.READER,
      Role.DESIGNER_ADMIN,
      Role.PUBLISHER_ADMIN,
    ];

    if (adminRoles.includes(user.role)) {
      await client.join(this.adminBoardRoom(boardId));
    } else {
      this.sendExceptionMessage(
        client,
        'No tienes permisos para unirte a este tablero',
      );
    }
  }

  async updateTaskStatus(
    client: AuthSocket,
    { taskId, toStatus, fromStatus }: UpdateTaskWsStatusDto,
  ) {
    try {
      const task = await this.taskService.updateTaskStatus({
        taskId,
        toStatus,
      });

      const payload = {
        taskId,
        toStatus,
        fromStatus,
        clientId: client.id,
      };

      if (task.assignedToId) {
        client
          .to(this.userRoom(task.assignedToId))
          .emit('task-status-updated', payload);
      }

      client
        .to(this.adminBoardRoom(task.boardId))
        .emit('task-status-updated', payload);
    } catch (error) {
      this.sendExceptionMessage(
        client,
        'No se pudo actualizar el estado de la tarea. Inténtalo de nuevo.',
      );
      this.logger.error((error as Error).message);
      throw new WsException(error as Error);
    }
  }

  async assignTask(client: AuthSocket, { taskId, userId }: AssignTaskDto) {
    try {
      const task = await this.taskService.assignTask({
        taskId,
        userId,
      });

      client.to(this.userRoom(userId)).emit('task-assigned', {
        task,
      });

      client.to(this.adminBoardRoom(task.boardId)).emit('task-assigned', {
        task,
      });
    } catch (error) {
      this.sendExceptionMessage(
        client,
        'No se pudo asignar la tarea. Inténtalo de nuevo.',
      );
      this.logger.error((error as Error).message);
      throw new WsException(error as Error);
    }
  }

  private sendNotification(toId: string, payload: { message: string }) {
    // this.client.emit(this.userRoom(toId)).to('notification', payload);
  }

  sendExceptionMessage(client: AuthSocket, message: string) {
    client.emit('exception-message', { message });
  }

  private logoutWs(client: AuthSocket) {
    client.emit('ws-logout', {
      message: 'Sesión cerrada desde otro dispositivo',
    });
    client.disconnect(true);
  }
}
