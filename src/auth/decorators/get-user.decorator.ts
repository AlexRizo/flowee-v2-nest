import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from '../interfaces/jwt.interface';

type Data = 'id' | 'email' | 'username' | undefined;

export const GetUser = createParamDecorator(
  (data: Data, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException(
        'Usuario no encontrado (get-user)',
      );
    }

    return !data ? user : (user[data] as UserPayload);
  },
);
