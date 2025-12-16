import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, TaskFileType } from '@prisma/client';
import { BoardsService } from 'src/boards/boards.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { type FilesPayload } from './pipes/task-files-payload.pipe';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { UpdateTaskStatusDto } from './dto/udpate-task-status.dto';
import { AssignTaskDto } from 'src/boards/dto/assign-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardsService: BoardsService,
    private readonly usersService: UsersService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  private readonly logger = new Logger(TasksService.name);

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException('No se encontró la tarea');
    }

    return task;
  }

  async findAsignedTasks(
    boardId: string,
    assigned: boolean = true,
    userId: string,
  ) {
    await this.boardsService.findOne(boardId);

    const userIsInBoard = await this.boardsService.userIsInBoard(
      boardId,
      userId,
    );

    if (!userIsInBoard) {
      throw new ForbiddenException('El usuario no pertenece al tablero');
    }

    const where = assigned
      ? { assignedToId: { not: null }, boardId }
      : { boardId };

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        board: true,
        author: true,
        assignedTo: true,
      },
    });

    if (!tasks || !tasks.length) {
      throw new NotFoundException('No se encontraron tareas');
    }

    return tasks;
  }

  async findAll() {
    const tasks = await this.prisma.task.findMany();

    if (!tasks || !tasks.length) {
      throw new NotFoundException('No se encontraron tareas');
    }

    return tasks;
  }

  // ? Este método obtiene las tareas de un tablero asignadas al usuario.
  async findMyTasksByBoard(boardId: string, userId: string) {
    await this.boardsService.findOne(boardId);
    const { role } = await this.usersService.findOne(userId);

    const where =
      role === Role.DESIGNER_ADMIN || role === Role.DESIGNER
        ? {
            boardId,
            AND: [{ assignedToId: userId }],
          }
        : {
            boardId,
            AND: [{ authorId: userId }, { assignedToId: { not: null } }],
          };

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        board: true,
        author: true,
        assignedTo: true,
      },
    });

    return tasks;
  }

  // ? Este método obtiene las tareas de un tablero.
  // ? se obtienen todas las tareas del tablero.
  async findTasksByBoard(boardId: string) {
    await this.boardsService.findOne(boardId);

    const tasks = await this.prisma.task.findMany({
      where: { boardId, assignedToId: { not: null } },
      include: {
        board: true,
        author: true,
        assignedTo: true,
      },
    });

    return tasks;
  }

  async findPendingTasksByBoard(boardId: string) {
    await this.boardsService.findOne(boardId);

    const tasks = await this.prisma.task.findMany({
      where: { boardId, assignedTo: null },
      include: {
        board: true,
        author: true,
      },
    });

    if (!tasks || !tasks.length) {
      return [];
    }

    return tasks;
  }

  async uploadFiles(taskId: string, files: FilesPayload) {
    await this.findOne(taskId);
    let message: string = 'Archivos subidos correctamente';

    const reqRes = await this.awsS3Service.uploadPrivateFiles(
      files.requiredFiles,
      'tasks/required',
    );

    const refRes = await this.awsS3Service.uploadPrivateFiles(
      files.referenceFiles,
      'tasks/reference',
    );

    try {
      const taskFiles = await this.prisma.taskFiles.createMany({
        data: [
          ...reqRes.successfulFiles.map(obj => ({
            ...obj,
            taskId,
            type: TaskFileType.REQUIRED,
          })),
          ...refRes.successfulFiles.map(obj => ({
            ...obj,
            taskId,
            type: TaskFileType.REFERENCE,
          })),
        ],
      });

      if (reqRes.rejectedFiles.length || refRes.rejectedFiles.length) {
        message = 'Ha ocurrido un error al subir algunos archivos';
      }

      return {
        message,
        rejectedFiles: [...reqRes.rejectedFiles, ...refRes.rejectedFiles],
        uploadedFiles: taskFiles,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async updateTaskStatus({ taskId, toStatus }: UpdateTaskStatusDto) {
    await this.findOne(taskId);

    try {
      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: { status: toStatus },
      });

      return updatedTask;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async assignTask({ taskId, userId }: AssignTaskDto) {
    await this.findOne(taskId);
    await this.usersService.findOne(userId);

    try {
      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: { assignedToId: userId },
        include: {
          board: true,
          assignedTo: true,
          author: true,
        },
      });

      return updatedTask;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findTaskFiles(taskId: string) {
    await this.findOne(taskId);

    const files = await this.prisma.taskFiles.findMany({
      where: { taskId },
    });

    return files;
  }

  async getTaskFileUrl(taskId: string, fileId: string, download: boolean) {
    await this.findOne(taskId);

    const file = await this.prisma.taskFiles.findFirst({
      where: { id: fileId, taskId },
    });

    if (!file) {
      throw new NotFoundException('No se encontró el archivo');
    }

    return this.awsS3Service.getSignedUrl(file.key, 60, download);
  }

  private handleDBErrors(error: any): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(`El fileKey ya está registrado`);
    }

    this.logger.error('Ha ocurrido un error inesperado', JSON.stringify(error));
    throw new InternalServerErrorException('Ha ocurrido un error inesperado');
  }
}
