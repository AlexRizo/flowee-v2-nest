import { User } from '@prisma/client';
import { Socket } from 'socket.io';

export interface AuthSocket extends Socket {
  userId: string;
}

export interface ConnectedClients {
  [userId: string]: {
    socket: AuthSocket;
    user: Omit<User, 'password' | 'refreshToken'>;
  };
}
