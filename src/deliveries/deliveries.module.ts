import { forwardRef, Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VersionsModule } from 'src/versions/versions.module';

@Module({
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
  exports: [DeliveriesService],
  imports: [PrismaModule, forwardRef(() => VersionsModule)],
})
export class DeliveriesModule {}
