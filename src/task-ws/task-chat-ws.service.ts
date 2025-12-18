import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class TaskChatWsService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage({ content, taskId, userId }: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: { content, taskId, userId },
      include: {
        user: true,
      },
    });

    return message;
  }
}
