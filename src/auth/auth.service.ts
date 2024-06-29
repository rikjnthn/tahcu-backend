import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { isEmail } from 'class-validator';

import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import generateCsrfToken from 'src/common/helper/generateCsrfToken';
import { AuthReturnType, UserPayloadType } from './interface/auth.interface';
import { EmailService } from 'src/common/email/email.service';
import { OtpService } from 'src/common/otp/otp.service';
import { SendOTPDto } from './dto/send-otp.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private otpService: OtpService,
  ) {}

  /**
   * Validate user
   *
   * @param loginDto login data
   *
   * @returns user's validity
   */
  private async validateUser({
    user_idOrEmail,
    password,
  }: LoginDto): Promise<AuthReturnType> {
    this.logger.log('Start validating user');

    const user = await this.prismaService.users.findFirst({
      where: {
        OR: [{ user_id: user_idOrEmail }, { email: user_idOrEmail }],
      },
    });

    if (!user) {
      this.logger.warn('User does not exist');

      throw new BadRequestException({
        error: {
          code: 'INVALID',
          message: `${
            isEmail(user_idOrEmail) ? 'Email' : 'User id'
          } or password is wrong`,
        },
      });
    }
    this.logger.log('Checking password');

    const isUser = await bcrypt.compare(password, user.password);

    if (!isUser) {
      this.logger.warn('Wrong password');

      throw new BadRequestException({
        error: {
          code: 'INVALID',
          message: `${
            isEmail(user_idOrEmail) ? 'Email' : 'User id'
          } or password is wrong`,
        },
      });
    }

    this.logger.log('User validated');

    const userData = {
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      username: user.username,
    };

    return await this.generateToken(userData);
  }

  /**
   * Send OTP to given email address
   *
   * @param email
   */
  async sendOtp(sendOTPDto: SendOTPDto): Promise<void> {
    this.logger.log('Check if user id or email has been used');

    const user = await this.prismaService.users.findFirst({
      where: {
        OR: [{ user_id: sendOTPDto.user_id }, { email: sendOTPDto.email }],
      },
    });

    if (!user) {
      this.logger.log('User id or email has not been used');

      await this.emailService.sendEmail(sendOTPDto.email);
      return;
    }

    this.logger.log('User id or email has been used');

    const errorMessage = {};

    if (user.email === sendOTPDto.email) {
      errorMessage['email'] = 'Email has already been used';
    }

    if (user.user_id === sendOTPDto.user_id) {
      errorMessage['user_id'] = 'User id has already been used';
    }

    throw new BadRequestException({
      error: {
        code: 'DUPLICATE_VALUE',
        message: errorMessage,
      },
    });
  }

  /**
   * Generate user's session id and CSRF token
   *
   * @param userData
   *
   * @returns user's session id and CSRF token
   */
  private async generateToken(
    userData: Omit<UserPayloadType, 'iat' | 'exp'>,
  ): Promise<AuthReturnType> {
    this.logger.log('Start generating token');

    const tahcu_authToken = await this.jwtService.signAsync(userData, {
      expiresIn: process.env.JWT_EXPIRED,
    });

    const CSRF_TOKEN = generateCsrfToken(tahcu_authToken);

    this.logger.log('Token generated');
    return [tahcu_authToken, CSRF_TOKEN];
  }

  /**
   * Login to user's account
   *
   * @param loginDto login data
   *
   * @returns user's session id and CSRF token
   */
  async login(loginDto: LoginDto): Promise<AuthReturnType> {
    this.logger.log('Start user login');
    return await this.validateUser(loginDto);
  }

  /**
   * Create user
   *
   * @param signUpDto sign up data
   * @param otp
   *
   * @returns user's data
   */
  async signUp(signUpDto: SignUpDto, otp: string): Promise<AuthReturnType> {
    this.logger.log('Start user sign up');

    const isOtpValid = await this.otpService.validateOtp(otp, signUpDto.email);

    if (!isOtpValid) {
      throw new BadRequestException({
        error: {
          code: 'INVALID',
          message: 'OTP is not valid',
        },
      });
    }

    const user = await this.usersService.create(signUpDto);

    const userData = {
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      username: user.username,
    };

    return await this.generateToken(userData);
  }

  /**
   * Verify user's session id
   *
   * @param token user's session id
   *
   * @returns validity of the token
   */
  async verifyTahcuToken(token: string): Promise<boolean> {
    this.logger.log('Start token verification');

    if (!token) {
      this.logger.warn('Token is not served');

      return false;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prismaService.users.findFirst({
        where: { id: payload.id },
      });

      if (!user) {
        this.logger.log('User is not found');

        return false;
      }

      this.logger.log('Token verified');

      return true;
    } catch {
      this.logger.warn('Token not verified');

      return false;
    }
  }

  /**
   * Refresh user session token
   *
   * @param userPayload
   *
   * @returns user's session id and CSRF token
   */
  async refreshToken(userPayload: UserPayloadType): Promise<AuthReturnType> {
    this.logger.log('Start refresh token');

    if (!userPayload) {
      this.logger.warn('User payload was not served');

      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User token is not valid',
        },
      });
    }

    const userData = {
      id: userPayload.id,
      user_id: userPayload.user_id,
      email: userPayload.email,
      username: userPayload.username,
    };

    const tahcu_authToken = await this.jwtService.signAsync(userData, {
      expiresIn: process.env.JWT_EXPIRED,
    });
    const CSRF_TOKEN = generateCsrfToken(tahcu_authToken);

    this.logger.log('Token refreshed');

    return [tahcu_authToken, CSRF_TOKEN];
  }
}
