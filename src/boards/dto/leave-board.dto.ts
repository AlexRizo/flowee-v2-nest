import { IsNotEmpty, IsUUID } from 'class-validator';

export class LeaveBoardDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
