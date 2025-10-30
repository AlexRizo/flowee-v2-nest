import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoardsModule } from 'src/boards/boards.module';

@Module({
  controllers: [TasksController],
  imports: [PrismaModule, BoardsModule],
  providers: [TasksService],
})
export class TasksModule {}
