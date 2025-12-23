import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UploadedFiles,
  UseInterceptors,
  Query,
  ParseBoolPipe,
  Delete,
  UploadedFile,
  ParseEnumPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { SpecialTasksService } from './special-tasks.service';
import { CreateSpecialTaskDto } from './dto/special-task.dto';
import { Role, TaskFileType } from '@prisma/client';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  type FilesPayload,
  TaskFilesPayloadPipe,
} from './pipes/task-files-payload.pipe';
import { adminRoles } from 'src/common/role-selector';
import { GetTasksQueryDto } from './dto/get-tasks-query.dto';
import { TaskFilePayloadPipe } from './pipes/task-file-payload.pipe';
import { TasksFilesService } from './tasks-files.service';
import { CreateDeliveryDto } from 'src/deliveries/dto/create-delivery.dto';
import { DeliveriesService } from 'src/deliveries/deliveries.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly specialTasksService: SpecialTasksService,
    private readonly tasksFilesService: TasksFilesService,
    private readonly deliveriesService: DeliveriesService,
  ) {}

  @Auth(...adminRoles, Role.DESIGNER_ADMIN, Role.PUBLISHER_ADMIN)
  @Get()
  findAsignedTasks(
    @Query() { boardId, assigned }: GetTasksQueryDto,
    @GetUser('id') userId: string,
  ) {
    return this.tasksService.findAsignedTasks(boardId, assigned, userId);
  }

  @Auth()
  @Get('my-tasks/board/:boardId')
  findMyTasksByBoard(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.tasksService.findMyTasksByBoard(boardId, userId);
  }

  @Auth(...adminRoles, Role.DESIGNER_ADMIN, Role.PUBLISHER_ADMIN)
  @Get('board/:boardId')
  findTasksByBoard(@Param('boardId', ParseUUIDPipe) boardId: string) {
    return this.tasksService.findTasksByBoard(boardId);
  }

  @Auth(...adminRoles, Role.DESIGNER_ADMIN, Role.PUBLISHER_ADMIN)
  @Get('board/:boardId/pending')
  findPendingTasksByBoard(@Param('boardId', ParseUUIDPipe) boardId: string) {
    return this.tasksService.findPendingTasksByBoard(boardId);
  }

  // ? Tareas Especiales
  @Auth(
    ...adminRoles,
    Role.DESIGNER_ADMIN,
    Role.PUBLISHER_ADMIN,
    Role.PUBLISHER,
  )
  @Post('special')
  createSpecialTask(
    @Body() specialTask: CreateSpecialTaskDto,
    @GetUser('id') userId: string,
  ) {
    return this.specialTasksService.createSpecialTask(specialTask, userId);
  }

  @Auth()
  @Post(':id/uploads')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'referenceFiles', maxCount: 5 },
        { name: 'requiredFiles', maxCount: 5 },
      ],
      {
        storage: memoryStorage(),
      },
    ),
  )
  uploadFiles(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles(
      new TaskFilesPayloadPipe({
        requiredReference: true,
        requiredFiles: true,
        allowEmptyArrays: false,
      }),
    )
    files: FilesPayload,
  ) {
    return this.tasksFilesService.uploadFiles(id, files);
  }

  @Auth()
  @Post(':id/upload/:type')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  uploadTaskFile(
    @Param('type', new ParseEnumPipe(TaskFileType))
    type: TaskFileType,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(new TaskFilePayloadPipe({ required: true }))
    file: Express.Multer.File,
  ) {
    return this.tasksFilesService.uploadTaskFile(id, type, file);
  }

  @Auth()
  @Get(':id/uploads')
  findTaskFiles(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksFilesService.findTaskFiles(id);
  }

  @Auth()
  @Get(':taskId/uploads/:fileId')
  getTaskFileUrl(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Query('download', ParseBoolPipe) download: boolean,
  ) {
    return this.tasksFilesService.getTaskFileUrl(taskId, fileId, download);
  }

  @Auth(
    ...adminRoles,
    Role.DESIGNER_ADMIN,
    Role.PUBLISHER_ADMIN,
    Role.PUBLISHER_ADMIN,
  )
  @Delete(':taskId/uploads/:fileId')
  deleteTaskFile(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ) {
    return this.tasksFilesService.deleteTaskFile(taskId, fileId);
  }

  @Auth()
  @Get(':taskId/chat')
  findChatMessages(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.tasksService.findChatMessages(taskId);
  }

  @Auth(
    ...adminRoles,
    Role.PUBLISHER,
    Role.PUBLISHER_ADMIN,
    Role.DESIGNER_ADMIN,
  )
  @Post(':taskId/deliveries')
  createDelivery(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() { name }: CreateDeliveryDto,
  ) {
    return this.deliveriesService.create({
      name,
      taskId,
    });
  }

  @Auth()
  @Get(':taskId/deliveries')
  findDeliveriesByTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.deliveriesService.findDeliveriesByTask(taskId);
  }
}
