import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadAvatarPipe } from './pipes/upload-avatar.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':term')
  findOne(@Param('term') id: string) {
    return this.usersService.findOne(id);
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Auth()
  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
    }),
  )
  updateAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(new UploadAvatarPipe()) file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(id, file);
  }

  // ? Realiza un soft-delete
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
