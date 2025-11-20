import { TaskStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  toStatus: TaskStatus;
}
