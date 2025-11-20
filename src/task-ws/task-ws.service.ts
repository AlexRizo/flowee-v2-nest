import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { BoardsService } from 'src/boards/boards.service';
import { ConnectedClients } from './interfaces/task-ws.interface';
import { UpdateTaskWsStatusDto } from './dto/update-task-ws-status.dto';
import { TasksService } from 'src/tasks/tasks.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class TaskWsService {
  private connectedClients: ConnectedClients = {};
  private readonly boardRoom = 'board-';

  private readonly logger = new Logger(TaskWsService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
    private readonly taskService: TasksService,
  ) {}

  getConnectedClients() {
    return this.connectedClients;
  }

  async registerClient(client: Socket, userId: string) {
    const user = await this.usersService.findOne(userId);

    this.connectedClients[client.id] = {
      socket: client,
      user,
    };
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  async joinUserToBoard(client: Socket, boardId: string) {
    const userIsInBoard = await this.boardsService.userIsInBoard(
      boardId,
      this.connectedClients[client.id].user.id,
    );

    if (userIsInBoard) {
      await client.join(this.boardRoom + boardId);
    } else {
      this.sendExceptionMessage(
        client,
        'No tienes permisos para unirte a este tablero',
      );
    }
  }

  async updateTaskStatus(
    client: Socket,
    { taskId, toStatus, fromStatus }: UpdateTaskWsStatusDto,
    server: Server,
  ) {
    try {
      const task = await this.taskService.updateTaskStatus({
        taskId,
        toStatus,
      });

      server
        .to(this.boardRoom + task.boardId)
        .emit('task-updated', { taskId, toStatus, fromStatus });
    } catch (error) {
      this.sendExceptionMessage(
        client,
        'No se pudo actualizar el estado de la tarea. Inténtalo de nuevo.',
      );
      this.logger.error((error as Error).message);
      return new WsException(error as Error);
    }
  }

  sendExceptionMessage(client: Socket, message: string) {
    client.emit('exception-message', { message });
  }
}
