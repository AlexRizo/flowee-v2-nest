import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { SpecialTasksService } from './special-tasks.service';
import { CreateSpecialTaskDto } from './dto/special-task.dto';
import { Role } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly specialTasksService: SpecialTasksService,
  ) {}

  @Auth()
  @Get('board/:boardId')
  findTasksByBoard(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.tasksService.findTasksByBoard(boardId, userId);
  }

  // ? Tareas Especiales
  @Auth(
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.DESIGNER_ADMIN,
    Role.PUBLISHER,
    Role.PUBLISHER_ADMIN,
  )
  @Post('special')
  createSpecialTask(
    @Body() specialTask: CreateSpecialTaskDto,
    @GetUser('id') userId: string,
  ) {
    return this.specialTasksService.createSpecialTask(specialTask, userId);
  }
}
