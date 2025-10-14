import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AssignManyBoardsDto } from './dto/assign-many-boards.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':boardId/assign')
  assignUser(
    @Body('userId', ParseUUIDPipe) userId: string,
    @Param('boardId', ParseUUIDPipe) boardId: string,
  ) {
    return this.boardsService.assignUserToBoard(boardId, userId);
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('assign-many')
  assignMany(@Body() assignManyBoardsDto: AssignManyBoardsDto) {
    return this.boardsService.assignManyBoards(assignManyBoardsDto);
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
