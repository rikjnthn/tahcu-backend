import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  Get,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/common/decorator/user.decorator';
import { AuthGuard } from './auth.guard';
import { UserPayloadType } from './interface/auth.interface';
import { SendOTPDto } from './dto/send-otp.dto';

const oneSecondInMs = 1000;
const thirtyMinutesInMs = 1_800_000;

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const tokens = await this.authService.login(loginDto);

    this.sentCookie(tokens, res);
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body('data') signUpDto: SignUpDto,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const tokens = await this.authService.signUp(signUpDto, otp);

    this.sentCookie(tokens, res);
  }

  @Throttle({ default: { ttl: oneSecondInMs, limit: 60 } })
  @Get('verify-tahcu-token/:token')
  async verifyTahcuToken(@Param('token') token: string): Promise<boolean> {
    return await this.authService.verifyTahcuToken(token);
  }

  @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refreshToken(
    @User() userPayload: UserPayloadType,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const tokens = await this.authService.refreshToken(userPayload);

    this.sentCookie(tokens, res);
  }

  @Throttle({ default: { ttl: thirtyMinutesInMs, limit: 15 } })
  @Post('send-otp')
  async sendOtp(@Body() sendOTPDto: SendOTPDto): Promise<void> {
    await this.authService.sendOtp(sendOTPDto);
  }

  private sentCookie(tokens: [string, string], res: Response) {
    const [tahcu_authToken, CSRF_TOKEN] = tokens;

    res.cookie('tahcu_auth', tahcu_authToken, {
      secure: true,
      expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRED)),
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
      path: process.env.COOKIE_PATH,
    });

    res.cookie('CSRF_TOKEN', CSRF_TOKEN, {
      secure: true,
      expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRED)),
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
      path: process.env.COOKIE_PATH,
    });
  }
}
