import { TaskPriority, TaskStatus, TaskType } from '@prisma/client';
import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

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
  assignedTo: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  author: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  board: string;

  @IsNotEmpty()
  @IsDate()
  dueDate: Date;
}
