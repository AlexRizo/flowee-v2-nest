import { TaskStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UpdateTaskStatusDto } from 'src/tasks/dto/udpate-task-status.dto';

export class UpdateTaskWsStatusDto extends UpdateTaskStatusDto {
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  fromStatus: TaskStatus;
}
