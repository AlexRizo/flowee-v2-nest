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
import { AssignManyBoardsDto } from './dto/assign-many-boards.dto';

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

  async assignUserToBoard(boardId: string, userId: string) {
    await this.findOne(boardId);
    await this.usersService.findOne(userId);

    try {
      await this.prisma.userBoard.create({
        data: { userId, boardId },
      });

      return { message: 'Tablero asignado correctamente' };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async assignManyBoards({ userId, boardIds }: AssignManyBoardsDto) {
    await this.usersService.findOne(userId);

    const verifyBoards = await this.prisma.board.findMany({
      where: { id: { in: boardIds } },
      select: { id: true },
    });

    if (verifyBoards.length !== boardIds.length) {
      throw new NotFoundException(
        'Algunos tableros no existen. Verifica la información',
      );
    }

    await this.prisma.userBoard.createMany({
      data: boardIds.map(boardId => ({ userId, boardId })),
      skipDuplicates: true,
    });

    return { message: 'Tableros asignados correctamente' };
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

    console.log(where);

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
