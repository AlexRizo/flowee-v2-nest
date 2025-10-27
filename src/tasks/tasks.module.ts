import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [TasksController],
  imports: [PrismaModule],
  providers: [TasksService],
})
export class TasksModule {}
