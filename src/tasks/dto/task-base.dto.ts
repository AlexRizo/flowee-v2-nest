import { TaskPriority, TaskStatus, TaskType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class TaskBaseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TaskStatus)
  @IsString()
  @IsNotEmpty()
  status: TaskStatus;

  @IsEnum(TaskPriority)
  @IsString()
  @IsNotEmpty()
  priority: TaskPriority;

  @IsEnum(TaskType)
  @IsString()
  @IsNotEmpty()
  type: TaskType;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  authorId?: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  boardId: string;

  @IsNotEmpty()
  @IsDateString()
  dueDate: Date;
}
