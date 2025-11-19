import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { UpdateBoardStatusDto } from './dto/update-board-status.dto';

interface ConnectedClients {
  [clientId: string]: {
    socket: Socket;
    user: Partial<User>;
  };
}

@Injectable()
export class TaskWsService {
  private connectedClients: ConnectedClients = {};

  constructor(private readonly usersService: UsersService) {}

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

  joinUserToBoard(
    client: Socket,
    { boardId, newStatus }: UpdateBoardStatusDto,
  ) {
    this.connectedClients[clientId].socket.join(boardId);
  }
}
