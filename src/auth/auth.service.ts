import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { generateCSRFToken } from './utils/csrf.util';

const cookieOptions = (minutes: number) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: minutes * 60 * 1000,
    sameSite: 'strict' as const,
    path: '/',
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneForAuth(email);

    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  private async signTokens(
    userId: string,
    email: string,
    username: string,
    role: Role,
  ) {
    const accessPayload = { id: userId, email, username, role };
    const refreshPayload = { id: userId, email, username, role };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES') || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES') || '1d',
    });

    return { accessToken, refreshToken };
  }

  async login(res: Response, { email, password }: LoginDto) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Correo y/o contraseña incorrectos');
    }

    const { accessToken, refreshToken } = await this.signTokens(
      user.id,
      user.email,
      user.username,
      user.role,
    );

    const refreshHash = await bcrypt.hash(refreshToken, 12);
    await this.usersService.updateRefreshToken(user.id, refreshHash);

    res.cookie('access_token', accessToken, cookieOptions(15));

    const refreshExpMinutes = this.parseDurationMinutes(
      this.configService.get('JWT_REFRESH_EXPIRES') || '1d',
    );

    res.cookie('refresh_token', refreshToken, cookieOptions(refreshExpMinutes));

    res.cookie('XSRF-TOKEN', generateCSRFToken(), {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutos;
      sameSite: 'strict',
      path: '/',
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async logout(res: Response, userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('XSRF-TOKEN', { path: '/' });

    return { message: 'Sesión finalizada' };
  }

  async checkAuth(userId: string) {
    const user = await this.usersService.findOne(userId);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async refresh(res: Response, userId: string, rt: string) {
    const user = await this.usersService.findOneForAuth(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(
        'Acceso denegado - user | user.refreshToken',
      );
    }

    const isMatch = await bcrypt.compare(rt, user.refreshToken);
    if (!isMatch) throw new UnauthorizedException('Acceso denegado - isMatch');

    const { accessToken, refreshToken } = await this.signTokens(
      user.id,
      user.email,
      user.username,
      user.role,
    );

    const newRefreshHash = await bcrypt.hash(refreshToken, 12);
    await this.usersService.updateRefreshToken(user.id, newRefreshHash);

    res.cookie('access_token', accessToken, cookieOptions(15));

    const refreshExpMinutes = this.parseDurationMinutes(
      this.configService.get('JWT_REFRESH_EXPIRES') || '1d',
    );

    res.cookie('refresh_token', refreshToken, cookieOptions(refreshExpMinutes));
    res.cookie('XSRF-TOKEN', generateCSRFToken(), {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutos;
      sameSite: 'strict',
      path: '/',
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  private parseDurationMinutes(value: string): number {
    const m = value.match(/^(\d+)([smhd])$/);
    if (!m) return 60 * 24 * 1; // fallback 1d
    const n = Number(m[1]);
    const unit = m[2];
    switch (unit) {
      case 's':
        return Math.ceil(n / 60);
      case 'm':
        return n;
      case 'h':
        return n * 60;
      case 'd':
        return n * 60 * 24;
      default:
        return 60 * 24 * 1; // fallback 1d
    }
  }
}
