import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
