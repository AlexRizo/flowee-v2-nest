import { createParamDecorator } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsClientData } from '../guards/interfaces/ws.interface';

type Data = 'id' | 'email' | 'username' | undefined;

export const WsUser = createParamDecorator((data: Data, ctx) => {
  const client = ctx.switchToWs().getClient<Socket<WsClientData>>();
  return !data
    ? (client.data as WsClientData).user
    : (client.data as WsClientData).user?.[data];
});
