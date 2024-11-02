import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { response } from 'express';

import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { OtpService } from 'src/common/otp/otp.service';
import { RedisService } from 'src/common/redis/redis.service';
import { EmailService } from 'src/common/email/email.service';
import { OtpModule } from 'src/common/otp/otp.module';
import { EmailModule } from 'src/common/email/email.module';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  describe('Unit Test', () => {
    let authService: AuthService;
    let redisService: RedisService;
    let otpService: OtpService;
    let emailService: EmailService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let prismaService: PrismaService;
    let authController: AuthController;

    const user_id = 'user_id_1';

    beforeAll(async () => {
      jwtService = new JwtService();
      prismaService = new PrismaService();
      redisService = new RedisService();
      otpService = new OtpService(redisService);
      usersService = new UsersService(prismaService, otpService);
      emailService = new EmailService(otpService);
      authService = new AuthService(
        usersService,
        prismaService,
        jwtService,
        emailService,
        otpService,
      );
      authController = new AuthController(authService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(authController).toBeDefined();
    });

    it('should return void when sign up', async () => {
      const signUpDto = {
        user_id,
        username: 'username_1',
        password: 'password',
        email: 'user_1@email.com',
      };

      jest.spyOn(authController, 'signUp').mockResolvedValue(undefined);

      const otp = '1234';

      await expect(
        authController.signUp(signUpDto, otp, response),
      ).resolves.toBeUndefined();

      expect(authController.signUp).toBeCalled();
      expect(authController.signUp).toBeCalledWith(signUpDto, otp, response);
    });

    it('should return void when login', async () => {
      const loginDto = {
        user_idOrEmail: user_id,
        password: 'password',
      };

      jest.spyOn(authController, 'login').mockResolvedValue(undefined);

      await expect(
        authController.login(loginDto, response),
      ).resolves.toBeUndefined();

      expect(authController.login).toBeCalled();
      expect(authController.login).toBeCalledWith(loginDto, response);
    });

    it('should return exception if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'not_exist_user_id',
        password: 'password',
      };

      const error = new BadRequestException({
        error: {
          code: 'INVALID',
          message: 'User id or password is wrong',
        },
      });

      jest.spyOn(authController, 'login').mockRejectedValue(error);

      await expect(
        authController.login(loginDto, response),
      ).rejects.toThrowError(error);
    });

    it('should return exception if password is wrong', async () => {
      const loginDto = {
        user_idOrEmail: user_id,
        password: 'wrong_password',
      };

      const error = new BadRequestException({
        error: {
          code: 'INVALID',
          message: 'User id or password is wrong',
        },
      });

      jest.spyOn(authController, 'login').mockRejectedValue(error);

      await expect(
        authController.login(loginDto, response),
      ).rejects.toThrowError(error);
    });

    it('should refresh token', async () => {
      const userPayload = {
        id: 'id_1',
        email: 'user_1@email.com',
        user_id,
        username: 'username_1',
        iat: 1,
        exp: 1,
      };

      jest.spyOn(authController, 'refreshToken').mockResolvedValue(undefined);

      await expect(
        authController.refreshToken(userPayload, response),
      ).resolves.toBeUndefined();

      expect(authController.refreshToken).toBeCalled();
      expect(authController.refreshToken).toBeCalledWith(userPayload, response);
    });

    it('should return true if token is valid', async () => {
      jest.spyOn(authController, 'verifyTahcuToken').mockResolvedValue(true);

      const isVerified = await authController.verifyTahcuToken(
        'tahcu_authToken',
      );

      expect(authController.verifyTahcuToken).toBeCalled();
      expect(authController.verifyTahcuToken).toBeCalledWith('tahcu_authToken');

      expect(isVerified).toBeTruthy();
    });

    it('should return false if token is valid but user is not found', async () => {
      jest.spyOn(authController, 'verifyTahcuToken').mockResolvedValue(false);

      const isVerified = await authController.verifyTahcuToken(
        'valid_token_but_user_not_found',
      );

      expect(authController.verifyTahcuToken).toBeCalled();
      expect(authController.verifyTahcuToken).toBeCalledWith(
        'valid_token_but_user_not_found',
      );

      expect(isVerified).toBeFalsy();
    });

    it('should return false if token is empty string', async () => {
      jest.spyOn(authController, 'verifyTahcuToken').mockResolvedValue(false);

      const isVerified = await authController.verifyTahcuToken('');

      expect(authController.verifyTahcuToken).toBeCalled();
      expect(authController.verifyTahcuToken).toBeCalledWith('');

      expect(isVerified).toBeFalsy();
    });

    it('should return false if token is not valid', async () => {
      jest.spyOn(authController, 'verifyTahcuToken').mockResolvedValue(false);

      const isVerified = await authController.verifyTahcuToken(
        'not_valid_token',
      );

      expect(authController.verifyTahcuToken).toBeCalled();
      expect(authController.verifyTahcuToken).toBeCalledWith('not_valid_token');

      expect(isVerified).toBeFalsy();
    });

    it('should send otp', async () => {
      jest.spyOn(authController, 'sendOtp').mockResolvedValue(undefined);

      await expect(
        authController.sendOtp({
          email: 'email@email.com',
          user_id: 'user_id',
        }),
      ).resolves.toBeUndefined();
    });

    it('should throw error when email or user_id have been used when request otp', async () => {
      const error = new BadRequestException({
        error: {
          code: 'DUPLICATE_VALUE',
          message: {
            email: 'Email has already been used',
            user_id: 'User id has already been used',
          },
        },
      });

      jest.spyOn(authController, 'sendOtp').mockRejectedValue(error);

      await expect(
        authController.sendOtp({
          email: 'email@email.com',
          user_id: 'user_id',
        }),
      ).rejects.toEqual(error);
    });

    it('should send reset password otp', async () => {
      jest
        .spyOn(authController, 'sendResetPasswordOtp')
        .mockResolvedValue(undefined);

      await expect(
        authController.sendResetPasswordOtp({ email: 'email@email.com' }),
      ).resolves.toBeUndefined();
    });

    it('should throw error when email is not served when reset password otp', async () => {
      const error = new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email should not be empty',
        },
      });

      jest
        .spyOn(authController, 'sendResetPasswordOtp')
        .mockRejectedValue(error);

      await expect(
        authController.sendResetPasswordOtp({ email: '' }),
      ).rejects.toEqual(error);
    });

    it('should throw error if user not found when reset password otp', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });

      jest
        .spyOn(authController, 'sendResetPasswordOtp')
        .mockRejectedValue(error);

      await expect(
        authController.sendResetPasswordOtp({
          email: 'not_exist_user@email.com',
        }),
      ).rejects.toEqual(error);
    });

    it('should reset password', async () => {
      jest.spyOn(authController, 'resetPassword').mockResolvedValue();

      await expect(
        authController.resetPassword({
          email: 'user_1@email.com',
          otp: 'OTP',
          password: 'new_password',
        }),
      ).resolves.toBeUndefined();
    });

    it("should throw error if account's password to be reset is not found", async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'User account to reset password does not exist',
        },
      });

      jest.spyOn(authController, 'resetPassword').mockRejectedValue(error);

      await expect(
        authController.resetPassword({
          email: 'user_1@email.com',
          otp: 'OTP',
          password: 'new_password',
        }),
      ).rejects.toThrow(error);
    });

    it("should throw error if reset password's otp is not valid", async () => {
      jest
        .spyOn(authController, 'resetPassword')
        .mockRejectedValue(new Error());

      await expect(
        authController.resetPassword({
          email: 'email@email.com',
          otp: 'INVALID_OTP',
          password: 'password',
        }),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });

  describe('Integration Test', () => {
    let emailService: EmailService;
    let otpService: OtpService;
    let redisService: RedisService;
    let jwtService: JwtService;
    let prismaService: PrismaService;
    let usersService: UsersService;
    let authController: AuthController;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          UsersModule,
          JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {
              expiresIn: process.env.JWT_EXPIRED,
            },
          }),
          PrismaModule,
          OtpModule,
          EmailModule,
          ThrottlerModule.forRoot([
            {
              ttl: parseInt(process.env.DEFAULT_THROTTLER_TTL),
              limit: parseInt(process.env.DEFAULT_THROTTLER_LIMIT),
            },
          ]),
        ],
        providers: [AuthService],
        controllers: [AuthController],
      }).compile();

      prismaService = module.get(PrismaService);
      emailService = module.get(EmailService);
      otpService = module.get(OtpService);
      redisService = module.get(RedisService);
      jwtService = module.get(JwtService);
      usersService = module.get(UsersService);
      authController = module.get(AuthController);
    });

    beforeAll(() => {
      jest
        .spyOn(authController as any, 'sentCookie')
        .mockResolvedValue(undefined);
    });

    afterEach(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(authController).toBeDefined();
    });

    it('should return void when sign up and user should be created', async () => {
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);

      const signUpDto = {
        user_id: 'user_id_1',
        username: 'username_1',
        password: 'password',
        email: 'user_1@email.com',
      };

      const otp = await otpService.generateOtp(signUpDto.email);

      await expect(
        authController.signUp(signUpDto, otp, response),
      ).resolves.toBeUndefined();

      const user = await prismaService.users.findFirst({
        where: { username: signUpDto.username },
      });

      expect(user).toBeDefined();
    });

    it('should return void when login', async () => {
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);

      const createUserDto = {
        email: 'user@gmail.com',
        password: 'password',
        user_id: 'user_id_1',
        username: 'username_1',
      };

      await usersService.create(createUserDto);

      const loginDto = {
        user_idOrEmail: createUserDto.user_id,
        password: 'password',
      };

      await expect(
        authController.login(loginDto, response),
      ).resolves.toBeUndefined();
    });

    it('should return exception if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'not_exist_user_id',
        password: 'password',
      };

      await expect(authController.login(loginDto, response)).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'INVALID',
            message: 'User id or password is wrong',
          },
        }),
      );
    });

    it('should return exception if password is wrong', async () => {
      const createUserDto = {
        email: 'user@gmail.com',
        password: 'password',
        user_id: 'user_id_1',
        username: 'username_1',
      };

      await usersService.create(createUserDto);

      const loginDto = {
        user_idOrEmail: createUserDto.user_id,
        password: 'wrong_password',
      };

      await expect(authController.login(loginDto, response)).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'INVALID',
            message: 'User id or password is wrong',
          },
        }),
      );
    });

    it('should refresh token', async () => {
      const userPayload = {
        id: 'user_id_1',
        email: 'user_1@email.com',
        user_id: 'user_id_1',
        username: 'username_1',
        iat: 1,
        exp: 1,
      };

      await expect(
        authController.refreshToken(userPayload, response),
      ).resolves.toBeUndefined();
    });

    it('should throw error when user payload is not served', async () => {
      await expect(
        authController.refreshToken(undefined, response),
      ).rejects.toThrowError(
        new UnauthorizedException({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User token is not valid',
          },
        }),
      );
    });

    it('should return true if token is valid', async () => {
      const createUserDto = {
        email: 'user@gmail.com',
        password: 'password',
        user_id: 'user_id_1',
        username: 'username_1',
      };

      const user = await usersService.create(createUserDto);

      const userPayload = {
        id: user.id,
        email: user.email,
        user_id: user.user_id,
        username: user.username,
      };

      const token = await jwtService.signAsync(userPayload, {
        secret: process.env.JWT_SECRET,
      });

      const isVerified = await authController.verifyTahcuToken(token);

      expect(isVerified).toBeTruthy();
    });

    it('should return false if token is empty string', async () => {
      const isVerified = await authController.verifyTahcuToken('');

      expect(isVerified).toBeFalsy();
    });

    it('should return false if token is valid but user is not found', async () => {
      const userPayload = {
        id: 'not_exist_id',
        email: 'not_exist_user@email.com',
        user_id: 'not_exist_user_id',
        username: 'not_exist_user',
      };

      const token = await jwtService.signAsync(userPayload, {
        secret: process.env.JWT_SECRET,
      });

      const isVerified = await authController.verifyTahcuToken(token);

      expect(isVerified).toBeFalsy();
    });

    it('should return false if token is not valid', async () => {
      const isVerified = await authController.verifyTahcuToken(
        'not_valid_token',
      );

      expect(isVerified).toBeFalsy();
    });

    it('should send otp', async () => {
      await expect(
        authController.sendOtp({
          email: 'email@email.com',
          user_id: 'user_id',
        }),
      ).resolves.toBeUndefined();
    });

    it('should throw error when email or user_id have been used when request otp', async () => {
      const createUserDto = {
        email: 'user@email.com',
        password: 'password',
        user_id: 'user_id_1',
        username: 'username_1',
      };

      const user = await usersService.create(createUserDto);

      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);

      await expect(
        authController.sendOtp({ email: user.email, user_id: user.user_id }),
      ).rejects.toEqual(
        new BadRequestException({
          error: {
            code: 'DUPLICATE_VALUE',
            message: {
              email: 'Email has already been used',
              user_id: 'User id has already been used',
            },
          },
        }),
      );
    });

    it('should send reset password otp', async () => {
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);

      const createUserDto = {
        email: 'user@email.com',
        password: 'password',
        user_id: 'user_id_1',
        username: 'username_1',
      };

      const user = await usersService.create(createUserDto);

      await expect(
        authController.sendResetPasswordOtp({ email: user.email }),
      ).resolves.toBeUndefined();
    });

    it('should throw error when email is not served when reset password otp', async () => {
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);

      await expect(
        authController.sendResetPasswordOtp({ email: '' }),
      ).rejects.toEqual(
        new BadRequestException({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email should not be empty',
          },
        }),
      );
    });

    it('should throw error if user not found when reset password otp', async () => {
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);

      await expect(
        authController.sendResetPasswordOtp({
          email: 'not_exist_user@email.com',
        }),
      ).rejects.toEqual(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        }),
      );
    });

    it('should reset password', async () => {
      const createUserDto = {
        email: 'user@gmail.com',
        password: 'password',
        user_id: 'user_id_1',
        username: 'username_1',
      };

      const createdUser = await usersService.create(createUserDto);

      const otp = await otpService.generateOtp(createUserDto.email);

      await authController.resetPassword({
        email: createUserDto.email,
        otp,
        password: 'new_password',
      });

      const user = await prismaService.users.findFirst({
        where: { id: createdUser.id },
      });

      expect(user).toBeDefined();
    });

    it("should throw error if account's password to be reset is not found", async () => {
      const otp = await otpService.generateOtp('not_found@email.com');

      await expect(
        authController.resetPassword({
          email: 'not_found@email.com',
          otp: otp,
          password: 'new_password',
        }),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'User account to reset password does not exist',
          },
        }),
      );
    });

    it('should throw error if otp is not valid', async () => {
      await expect(
        authController.resetPassword({
          email: 'email@email.com',
          otp: 'INVALID_OTP',
          password: 'password',
        }),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);

      await redisService.quit();
    });
  });
});
