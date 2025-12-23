import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { VersionsService } from './versions.service';

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versionsService.remove(id);
  }
}
