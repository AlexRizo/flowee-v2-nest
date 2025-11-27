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
import { Board, Prisma, Role, TaskStatus } from '@prisma/client';
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

    const existingAssignment = await this.prisma.userBoard.findFirst({
      where: { boardId, userId },
    });

    if (existingAssignment) {
      throw new ConflictException('El usuario ya está asignado a este tablero');
    }

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

    const board = await this.prisma.board.findUnique({ where });

    if (!board) {
      throw new NotFoundException(
        `No se encontró el tablero con el término ${term}`,
      );
    }

    return board;
  }

  async findUserBoards(userTerm: string) {
    const { id: userId } = await this.usersService.findOne(userTerm);

    const userBoards = await this.prisma.userBoard.findMany({
      where: { userId },
      include: { board: true },
    });

    if (!userBoards || !userBoards.length) {
      return [];
    }

    const boards = userBoards.map(userBoard => userBoard.board);

    return boards;
  }

  async findBoardUsers(boardId: string, role?: Role) {
    const { name: boardName } = await this.findOne(boardId);

    const where = role ? { boardId, user: { role } } : { boardId };

    //* Consulta separada para evitar el código hadouken;
    const userWhere = {
      status: {
        in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.FOR_REVIEW],
      },
    };

    const userInclude = {
      assignedTasks: {
        where: userWhere,
        select: {
          id: true,
          status: true,
        },
      },
    };

    const boardUsers = await this.prisma.userBoard.findMany({
      where,
      include: {
        user: { include: userInclude },
      },
    });

    if (!boardUsers || !boardUsers.length) {
      throw new NotFoundException(
        `No se encontraron usuarios para el tablero ${boardName}`,
      );
    }

    const users = boardUsers.map(({ user }) => ({
      ...user,
      tasksCount: {
        pending: user.assignedTasks.filter(
          task => task.status === TaskStatus.PENDING,
        ).length,
        inProgress: user.assignedTasks.filter(
          task => task.status === TaskStatus.IN_PROGRESS,
        ).length,
        forReview: user.assignedTasks.filter(
          task => task.status === TaskStatus.FOR_REVIEW,
        ).length,
      },
    }));

    return users;
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.board.delete({ where: { id } });

      return { message: 'Tablero eliminado correctamente' };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async leaveBoard(boardTerm: string, userId: string) {
    const { id: boardId, name: boardName } = await this.findOne(boardTerm);

    const { name: userName } = await this.usersService.findOne(userId);

    const assignment = await this.prisma.userBoard.findFirst({
      where: { boardId, userId },
    });

    if (!assignment) {
      throw new NotFoundException(
        `El usuario ${userName} no está asignado al tablero ${boardName}`,
      );
    }

    try {
      await this.prisma.userBoard.delete({ where: { id: assignment.id } });
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async userIsInBoard(boardId: string, userId: string) {
    const { role: userRole } = await this.usersService.findOne(userId);

    if (
      userRole &&
      (userRole === this.roles.ADMIN ||
        userRole === this.roles.SUPER_ADMIN ||
        userRole === this.roles.READER)
    ) {
      return true;
    }

    const assignment = await this.prisma.userBoard.findFirst({
      where: { boardId, userId },
    });

    return !!assignment;
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
