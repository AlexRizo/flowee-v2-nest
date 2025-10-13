import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { GetUser } from './decorators/get-user.decorator';
import type { UserPayload } from './interfaces/jwt.interface';
import { Auth } from './decorators/auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth()
  @Get('me')
  checkAuth(@GetUser() user: UserPayload) {
    return this.authService.checkAuth(user.id);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Res({ passthrough: true }) res: Response, @Body() body: LoginDto) {
    return this.authService.login(res, body);
  }

  @Auth()
  @Post('logout')
  logout(
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: UserPayload,
  ) {
    return this.authService.logout(res, user.id);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: UserPayload,
  ) {
    console.log(user);
    return this.authService.refresh(res, user.id, user.refreshToken);
  }
}
