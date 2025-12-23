import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  description: string;
}
