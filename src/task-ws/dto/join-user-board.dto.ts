import { IsNotEmpty, IsUUID } from 'class-validator';

export class JoinUserBoardDto {
  @IsUUID()
  @IsNotEmpty()
  boardId: string;
}
