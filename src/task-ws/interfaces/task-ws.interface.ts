import { User } from '@prisma/client';
import { Socket } from 'socket.io';

export interface ConnectedClients {
  [clientId: string]: {
    socket: Socket;
    user: Omit<User, 'password' | 'refreshToken'>;
  };
}
