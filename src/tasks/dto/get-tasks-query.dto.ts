import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class GetTasksQueryDto {
  @IsString()
  @IsUUID()
  boardId: string;

  @IsOptional()
  @Type(() => Boolean)
  assigned: boolean = true;
}
