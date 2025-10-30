import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';

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

  // ? Realiza un soft-delete
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
