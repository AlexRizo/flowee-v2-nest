import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskBaseDto } from './task-base.dto';

export class CreateSpecialTaskDto extends TaskBaseDto {
  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  legals?: string;
}
