import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { BoardsService } from 'src/boards/boards.service';
import { UpdateTaskWsStatusDto } from './dto/update-task-ws-status.dto';
import { TasksService } from 'src/tasks/tasks.service';
import { AssignTaskDto } from '../boards/dto/assign-task.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TaskWsService {
  private readonly logger = new Logger(TaskWsService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
    private readonly taskService: TasksService,
  ) {}

  async updateTaskStatus({
    taskId,
    toStatus,
    fromStatus,
  }: UpdateTaskWsStatusDto) {
    const updatedTask = await this.taskService.updateTaskStatus({
      taskId,
      toStatus,
    });

    return {
      task: updatedTask,
      fromStatus,
      toStatus,
    };
  }

  async assignTask({ taskId, userId }: AssignTaskDto) {
    const oldTask = await this.taskService.findOne(taskId);

    const updatedTask = await this.taskService.assignTask({
      taskId,
      userId,
    });

    return {
      task: updatedTask,
      oldAssigneeId: oldTask.assignedToId,
      newAssigneeId: userId,
    };
  }

  async validateJoinBoard(userId: string) {
    const { role: currentUserRole } = await this.usersService.findOne(userId);

    const adminRoles: Role[] = [
      Role.ADMIN,
      Role.SUPER_ADMIN,
      Role.READER,
      Role.DESIGNER_ADMIN,
      Role.PUBLISHER_ADMIN,
    ];

    return adminRoles.includes(currentUserRole);
  }

  async userIsBoardMember(boardId: string, userId: string) {
    const userIsInBoard = await this.boardsService.userIsInBoard(
      boardId,
      userId,
    );

    return userIsInBoard;
  }
}
