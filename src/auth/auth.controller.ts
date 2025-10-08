import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { GetUser } from './decorators/get-user.decorator';
import type { UserPayload } from './interfaces/jwt.interface';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
