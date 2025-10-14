import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignSingleBoardsDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
