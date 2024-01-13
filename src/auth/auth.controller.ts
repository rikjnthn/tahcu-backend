import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaKnownRequestErrorFilter } from 'src/common/filter/prisma-known-request-error.filter';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@UseFilters(PrismaKnownRequestErrorFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const token = await this.authService.login(loginDto);

    response.cookie('tahcu_auth', JSON.stringify(token), {
      secure: true,
      expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRED)),
      sameSite: 'lax',
    });
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const token = await this.authService.signUp(signUpDto);

    response.cookie('tahcu_auth', JSON.stringify(token), {
      secure: true,
      expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRED)),
      sameSite: 'lax',
    });
  }
}
