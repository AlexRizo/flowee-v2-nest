import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, Task, TaskFileType } from '@prisma/client';
import { BoardsService } from 'src/boards/boards.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { type FilesPayload } from './pipes/task-files-payload.pipe';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardsService: BoardsService,
    private readonly usersService: UsersService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  private roles = Role;
  private readonly logger = new Logger(TasksService.name);

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

    const include = {
      board: true,
      author: true,
      assignedTo: true,
    };

    if (
      userRole === this.roles.ADMIN ||
      userRole === this.roles.SUPER_ADMIN ||
      userRole === this.roles.READER ||
      userRole === this.roles.DESIGNER_ADMIN ||
      userRole === this.roles.PUBLISHER_ADMIN
    ) {
      tasks = await this.prisma.task.findMany({ where: { boardId }, include });
    } else {
      tasks = await this.prisma.task.findMany({
        where: {
          boardId,
          OR: [{ authorId: userId }, { assignedToId: userId }],
        },
        include,
      });
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

  private handleDBErrors(error: any) {
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
