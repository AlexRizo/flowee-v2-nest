import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService],
  imports: [UsersModule, PrismaModule],
})
export class BoardsModule {}
