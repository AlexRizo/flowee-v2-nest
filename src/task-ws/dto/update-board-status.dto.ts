import { TaskStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateBoardStatusDto {
  @IsUUID()
  @IsNotEmpty()
  boardId: string;

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  newStatus: TaskStatus;
}
