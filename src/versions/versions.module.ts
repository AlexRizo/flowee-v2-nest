import { forwardRef, Module } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { VersionsController } from './versions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AwsModule } from 'src/aws/aws.module';
import { DeliveriesModule } from 'src/deliveries/deliveries.module';

@Module({
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
  imports: [PrismaModule, AwsModule, forwardRef(() => DeliveriesModule)],
})
export class VersionsModule {}
