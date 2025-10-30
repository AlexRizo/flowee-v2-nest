import { Injectable, NotFoundException } from '@nestjs/common';
import { Role, Task, User } from '@prisma/client';
import { BoardsService } from 'src/boards/boards.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardsService: BoardsService,
  ) {}

  private roles = Role;

  async findAll() {
    const tasks = await this.prisma.task.findMany();

    if (!tasks || !tasks.length) {
      throw new NotFoundException('No se encontraron tareas');
    }

    return tasks;
  }

  async findTasksByBoard(
    boardId: string,
    { role: userRole, id: userId }: User,
  ) {
    await this.boardsService.findOne(boardId);

    let tasks: Task[];

    if (
      userRole === this.roles.ADMIN ||
      userRole === this.roles.SUPER_ADMIN ||
      userRole === this.roles.READER ||
      userRole === this.roles.DESIGNER_ADMIN ||
      userRole === this.roles.PUBLISHER_ADMIN
    ) {
      tasks = await this.prisma.task.findMany({ where: { boardId } });
    } else {
      tasks = await this.prisma.task.findMany({
        where: {
          boardId,
          OR: [{ authorId: userId }, { assignedToId: userId }],
        },
      });
    }

    return tasks;
  }
}
