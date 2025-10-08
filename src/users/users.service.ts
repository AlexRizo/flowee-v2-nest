import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { isEmail, isUUID } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(UsersService.name);

  async create({ password, ...createUserDto }: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: bcrypt.hashSync(password, 10),
        },
        omit: { password: true, refreshToken: true },
      });

      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      omit: { password: true, refreshToken: true },
      where: { isActive: true },
    });

    if (!users || !users.length) {
      throw new NotFoundException('No se encontraron usuarios');
    }

    return users;
  }

  async findOne(term: string) {
    const where = isUUID(term)
      ? { id: term }
      : isEmail(term)
        ? { email: term }
        : { username: term };

    const user = await this.prisma.user.findUnique({
      where: { ...where, isActive: true },
      omit: { password: true, refreshToken: true },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con el término "${term}" no encontrado`,
      );
    }

    return user;
  }

  async findOneForAuth(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email, isActive: true },
    });

    return user;
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    await this.findOne(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  private handleDBErrors(error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = error.meta?.target as string[];

      const field =
        target[0] === 'email' ? 'correo electrónico' : 'nombre de usuario';

      throw new ConflictException(`El ${field} ya está registrado`);
    }

    this.logger.error('Ha ocurrido un error inesperado', JSON.stringify(error));
    throw new InternalServerErrorException('Ha ocurrido un error inesperado');
  }
}
