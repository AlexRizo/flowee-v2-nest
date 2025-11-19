import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskWDto } from './create-task-w.dto';

export class UpdateTaskWDto extends PartialType(CreateTaskWDto) {
  id: number;
}
