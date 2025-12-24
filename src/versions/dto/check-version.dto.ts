import { VersionStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CheckVersionDto {
  @IsNotEmpty()
  @IsEnum(VersionStatus)
  status: VersionStatus;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  comment: string;
}
