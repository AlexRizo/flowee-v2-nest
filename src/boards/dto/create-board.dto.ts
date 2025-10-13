import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  prefix: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El slug solo puede contener letras, números y guiones bajos',
  })
  slug: string;
}
