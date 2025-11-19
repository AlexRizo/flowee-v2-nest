import { createParamDecorator } from '@nestjs/common';
import { UserPayload } from '../interfaces/jwt.interface';
import { Socket } from 'socket.io';
import { WsClientData } from '../guards/interfaces/ws.interface';

export const WsUser = () =>
  createParamDecorator((data: unknown, ctx): UserPayload | undefined => {
    const client = ctx.switchToWs().getClient<Socket<WsClientData>>();
    return (client.data as WsClientData).user;
  });
