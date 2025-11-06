import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoardsModule } from 'src/boards/boards.module';
import { UsersModule } from 'src/users/users.module';
import { SpecialTasksService } from './special-tasks.service';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  controllers: [TasksController],
  imports: [PrismaModule, BoardsModule, UsersModule, AwsModule],
  providers: [TasksService, SpecialTasksService],
})
export class TasksModule {}
