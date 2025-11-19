import { Module } from '@nestjs/common';
import { TaskWsService } from './task-ws.service';
import { TaskWsGateway } from './task-ws.gateway';

@Module({
  providers: [TaskWsGateway, TaskWsService],
})
export class TaskWsModule {}
