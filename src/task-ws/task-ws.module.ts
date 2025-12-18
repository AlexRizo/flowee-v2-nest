import { Module } from '@nestjs/common';
import { TaskWsService } from './task-ws.service';
import { TaskWsGateway } from './task-ws.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { BoardsModule } from 'src/boards/boards.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { TaskChatWsService } from './task-chat-ws.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [TaskWsGateway, TaskWsService, TaskChatWsService],
  imports: [UsersModule, BoardsModule, AuthModule, TasksModule, PrismaModule],
})
export class TaskWsModule {}
