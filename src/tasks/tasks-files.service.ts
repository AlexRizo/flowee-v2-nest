import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { TasksService } from './tasks.service';
import { FilesPayload } from './pipes/task-files-payload.pipe';
import { Prisma, TaskFileType } from '@prisma/client';

@Injectable()
export class TasksFilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  private readonly logger = new Logger(TasksFilesService.name);

  async findTaskFiles(taskId: string) {
    await this.tasksService.findOne(taskId);

    const files = await this.prisma.taskFiles.findMany({
      where: { taskId },
    });

    return files;
  }

  async getTaskFileUrl(taskId: string, fileId: string, download: boolean) {
    await this.tasksService.findOne(taskId);

    const file = await this.prisma.taskFiles.findFirst({
      where: { id: fileId, taskId },
    });

    if (!file) {
      throw new NotFoundException('No se encontró el archivo');
    }

    return this.awsS3Service.getSignedUrl(file.key, 60, download);
  }

  async uploadFiles(taskId: string, files: FilesPayload) {
    await this.tasksService.findOne(taskId);
    let message: string = 'Archivos subidos correctamente';

    const reqRes = await this.awsS3Service.uploadPrivateFiles(
      files.requiredFiles,
      `tasks/${taskId}/required`,
    );

    const refRes = await this.awsS3Service.uploadPrivateFiles(
      files.referenceFiles,
      `tasks/${taskId}/reference`,
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

  async uploadTaskFile(
    taskId: string,
    type: TaskFileType,
    file: Express.Multer.File,
  ) {
    await this.tasksService.findOne(taskId);

    try {
      const fileRes = await this.awsS3Service.uploadPrivateFile(
        file,
        `tasks/${taskId}/${type.toLowerCase()}`,
      );

      const taskFile = await this.prisma.taskFiles.create({
        data: {
          taskId,
          key: fileRes.key,
          fileName: fileRes.fileName,
          type,
        },
      });

      return taskFile;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async deleteTaskFile(taskId: string, fileId: string) {
    await this.tasksService.findOne(taskId);

    const file = await this.prisma.taskFiles.findFirst({
      where: { id: fileId, taskId },
    });

    if (!file) {
      throw new NotFoundException('No se encontró el archivo');
    }

    try {
      await this.awsS3Service.deleteFile(file.key);
      await this.prisma.taskFiles.delete({ where: { id: fileId } });
    } catch (error) {
      this.handleDBErrors(error);
    }
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
