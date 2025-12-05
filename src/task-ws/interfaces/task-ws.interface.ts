import { Socket } from 'socket.io';
import { UserPayload } from 'src/auth/interfaces/jwt.interface';

export interface AuthSocket extends Socket {
  userId: string;
  data: {
    user: Pick<UserPayload, 'username' | 'email' | 'role'>;
  };
}
