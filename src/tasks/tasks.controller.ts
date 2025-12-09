import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { SpecialTasksService } from './special-tasks.service';
import { CreateSpecialTaskDto } from './dto/special-task.dto';
import { Role } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  type FilesPayload,
  TaskFilesPayloadPipe,
} from './pipes/task-files-payload.pipe';
import { AdminRoles } from 'src/common/role-selector';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly specialTasksService: SpecialTasksService,
  ) {}

  @Auth()
  @Get('my-tasks/board/:boardId')
  findMyTasksByBoard(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.tasksService.findMyTasksByBoard(boardId, userId);
  }

  @Auth(...AdminRoles, Role.DESIGNER_ADMIN, Role.PUBLISHER_ADMIN)
  @Get('board/:boardId')
  findTasksByBoard(@Param('boardId', ParseUUIDPipe) boardId: string) {
    return this.tasksService.findTasksByBoard(boardId);
  }

  @Auth(...AdminRoles, Role.DESIGNER_ADMIN, Role.PUBLISHER_ADMIN)
  @Get('board/:boardId/pending')
  findPendingTasksByBoard(@Param('boardId', ParseUUIDPipe) boardId: string) {
    return this.tasksService.findPendingTasksByBoard(boardId);
  }

  // ? Tareas Especiales
  @Auth(...AdminRoles, Role.DESIGNER_ADMIN, Role.PUBLISHER_ADMIN)
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
    return this.tasksService.uploadFiles(id, files);
  }
}
