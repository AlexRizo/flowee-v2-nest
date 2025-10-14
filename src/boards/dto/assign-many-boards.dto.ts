import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class AssignManyBoardsDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  @IsNotEmpty({ each: true })
  boardIds: string[];
}
