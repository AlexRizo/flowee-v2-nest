import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignSingleBoardDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
