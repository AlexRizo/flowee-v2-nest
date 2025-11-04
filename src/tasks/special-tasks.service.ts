import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSpecialTaskDto } from './dto/special-task.dto';
import { UsersService } from 'src/users/users.service';
import { BoardsService } from 'src/boards/boards.service';

@Injectable()
export class SpecialTasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
  ) {}

  async createSpecialTask(createTaskDto: CreateSpecialTaskDto, userId: string) {
    const { id: authorId } = await this.usersService.findOne(
      createTaskDto.authorId || userId,
    );

    await this.boardsService.findOne(createTaskDto.boardId);

    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        priority: createTaskDto.priority,
        type: createTaskDto.type,
        boardId: createTaskDto.boardId,
        dueDate: createTaskDto.dueDate,
        authorId,
        specialTask: {
          create: {
            size: createTaskDto.size,
            legals: createTaskDto.legals,
          },
        },
      },
    });

    return task;
  }
}
