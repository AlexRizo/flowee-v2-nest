import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignTaskDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
