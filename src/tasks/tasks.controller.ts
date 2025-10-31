import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Auth()
  @Get('board/:boardId')
  findTasksByBoard(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.tasksService.findTasksByBoard(boardId, userId);
  }
}
