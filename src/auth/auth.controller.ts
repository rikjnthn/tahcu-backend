import { Controller, Post, Body, Res } from '@nestjs/common';

import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body('idOrEmail') idOrEmail: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const COOKIE_EXPIRED = 5184000000; // 2 months

    response.cookie(
      'tahcu_auth',
      await this.authService.login(idOrEmail, password),
      {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + COOKIE_EXPIRED),
      },
    );
  }
}
