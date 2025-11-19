import { Injectable } from '@nestjs/common';
import { CreateTaskWDto } from './dto/create-task-w.dto';
import { UpdateTaskWDto } from './dto/update-task-w.dto';

@Injectable()
export class TaskWsService {
  create(createTaskWDto: CreateTaskWDto) {
    return 'This action adds a new taskW';
  }

  findAll() {
    return `This action returns all taskWs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} taskW`;
  }

  update(id: number, updateTaskWDto: UpdateTaskWDto) {
    return `This action updates a #${id} taskW`;
  }

  remove(id: number) {
    return `This action removes a #${id} taskW`;
  }
}
