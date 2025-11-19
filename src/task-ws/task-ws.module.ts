import { Module } from '@nestjs/common';
import { TaskWsService } from './task-ws.service';
import { TaskWsGateway } from './task-ws.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [TaskWsGateway, TaskWsService],
  imports: [UsersModule, AuthModule],
})
export class TaskWsModule {}
