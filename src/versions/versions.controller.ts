import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { VersionsService } from './versions.service';
import { CheckVersionDto } from './dto/check-version.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { adminRoles, publisherRoles } from 'src/common/role-selector';
import { Role } from '@prisma/client';

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

  @Get(':versionId/upload')
  getFile(
    @Param('versionId') versionId: string,
    @Query('download') download: boolean,
  ) {
    return this.versionsService.getFile(versionId, download);
  }

  @Get()
  findAll() {
    return this.versionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.versionsService.findOne(id);
  }

  @Auth(...adminRoles, ...publisherRoles, Role.DESIGNER_ADMIN)
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
