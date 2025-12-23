import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateVersionDto } from 'src/versions/dto/create-version.dto';
import { VersionsService } from 'src/versions/versions.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ParseVersionFilePipe } from 'src/versions/pipes/parse-version-file.pipe';

@Controller('deliveries')
export class DeliveriesController {
  constructor(
    private readonly deliveriesService: DeliveriesService,
    private readonly versionsService: VersionsService,
  ) {}

  @Auth()
  @Post(':deliveryId/versions')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  createVersion(
    @Param('deliveryId', ParseUUIDPipe) deliveryId: string,
    @Body() { description }: CreateVersionDto,
    @UploadedFile(new ParseVersionFilePipe())
    file: Express.Multer.File,
  ) {
    return this.versionsService.create({
      deliveryId,
      description,
      attachment: file,
    });
  }
}
