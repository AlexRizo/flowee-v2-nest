import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN, Role.READER)
  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @Auth()
  @Get('my-boards')
  findMyBoards(@GetUser('id') userId: string) {
    return this.boardsService.findMyBoards(userId);
  }

  @Auth()
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.boardsService.findOne(term);
  }
}
