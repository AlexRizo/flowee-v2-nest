import {
  IsHexColor,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  prefix: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'El slug solo puede contener letras, números y guiones',
  })
  slug: string;

  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  color: string;
}
