import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { Board, Prisma, Role } from '@prisma/client';
import { isUUID } from 'class-validator';

@Injectable()
export class BoardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  private readonly logger = new Logger(BoardsService.name);

  private roles = Role;

  async create(createBoardDto: CreateBoardDto) {
    try {
      const board = await this.prisma.board.create({
        data: createBoardDto,
      });

      return board;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findMyBoards(userId: string) {
    const { role } = await this.usersService.findOne(userId);

    let boards: Board[];

    if (
      role === this.roles.ADMIN ||
      role === this.roles.SUPER_ADMIN ||
      role === this.roles.READER
    ) {
      boards = await this.findAll();
    } else {
      const userBoards = await this.prisma.userBoard.findMany({
        where: { userId },
        include: { board: true },
      });

      boards = userBoards.map(userBoard => userBoard.board);
    }

    if (!boards || !boards.length) {
      throw new NotFoundException('No se encontraron tableros');
    }

    return boards;
  }

  async findAll() {
    const boards = await this.prisma.board.findMany();

    if (!boards || !boards.length) {
      throw new NotFoundException('No se encontraron tableros');
    }

    return boards;
  }

  async findOne(term: string) {
    const where = isUUID(term) ? { id: term } : { slug: term };

    const board = await this.prisma.board.findUnique({ where });

    if (!board) {
      throw new NotFoundException(
        `No se encontró el tablero con el término ${term}`,
      );
    }

    return board;
  }

  private handleDBErrors(error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(`El slug ya está registrado`);
    }

    this.logger.error('Ha ocurrido un error inesperado', JSON.stringify(error));
    throw new InternalServerErrorException('Ha ocurrido un error inesperado');
  }
}
