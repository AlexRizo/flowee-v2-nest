import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
