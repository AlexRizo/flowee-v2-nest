import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { VersionsService } from './versions.service';
import { CheckVersionDto } from './dto/check-version.dto';

@Controller('versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Post()
  create(
    @Body()
    {
      description,
      deliveryId,
      attachment,
    }: {
      description: string;
      deliveryId: string;
      attachment: Express.Multer.File;
    },
  ) {
    return this.versionsService.create({
      description,
      deliveryId,
      attachment,
    });
  }

  @Get()
  findAll() {
    return this.versionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.versionsService.findOne(id);
  }

  @Patch(':versionId/check')
  check(
    @Param('versionId') versionId: string,
    @Body() versionDataDto: CheckVersionDto,
  ) {
    return this.versionsService.check(versionId, versionDataDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versionsService.remove(id);
  }
}
