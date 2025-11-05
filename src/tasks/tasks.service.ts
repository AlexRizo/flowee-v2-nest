import { Injectable, NotFoundException } from '@nestjs/common';
import { Role, Task } from '@prisma/client';
import { BoardsService } from 'src/boards/boards.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { type FilesPayload } from './pipes/task-files-payload.pipe';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardsService: BoardsService,
    private readonly usersService: UsersService,
  ) {}

  private roles = Role;

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('No se encontró la tarea');
    }

    return task;
  }

  async findAll() {
    const tasks = await this.prisma.task.findMany();

    if (!tasks || !tasks.length) {
      throw new NotFoundException('No se encontraron tareas');
    }

    return tasks;
  }

  async findTasksByBoard(boardId: string, userId: string) {
    await this.boardsService.findOne(boardId);
    const { role: userRole } = await this.usersService.findOne(userId);

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

  async uploadFiles(taskId: string, files: FilesPayload) {
    await this.findOne(taskId);

    console.log(files);

    return {
      message: 'Archivos subidos correctamente',
    };
  }
}
