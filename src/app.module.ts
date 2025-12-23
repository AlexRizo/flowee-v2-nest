import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { TasksModule } from './tasks/tasks.module';
import { AwsModule } from './aws/aws.module';
import { validateEnv } from './config/env.validation';
import { TaskWsModule } from './task-ws/task-ws.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { VersionsModule } from './versions/versions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    BoardsModule,
    TasksModule,
    AwsModule,
    TaskWsModule,
    DeliveriesModule,
    VersionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
