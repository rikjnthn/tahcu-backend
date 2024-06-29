import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { OtpService } from 'src/common/otp/otp.service';
import { RedisService } from 'src/common/redis/redis.service';
import { EmailService } from 'src/common/email/email.service';
import { OtpModule } from 'src/common/otp/otp.module';
import { EmailModule } from 'src/common/email/email.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { response } from 'express';

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

    const user_1 = 'user_1';

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

    it('should be defined', () => {
      expect(authController).toBeDefined();
    });

    it('should return tokens when sign up', async () => {
      const signUpDto = {
        user_id: user_1,
        username: 'username_1',
        password: 'password',
        email: 'user_1@gmail.com',
      };

      jest.spyOn(authController, 'signUp').mockResolvedValue(undefined);

      const otp = '1234';

      const shouldBeUndefined = await authController.signUp(
        signUpDto,
        otp,
        response,
      );

      expect(authController.signUp).toBeCalled();
      expect(authController.signUp).toBeCalledWith(signUpDto, otp, response);

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return tokens when login', async () => {
      const loginDto = {
        user_idOrEmail: user_1,
        password: 'password',
      };

      jest.spyOn(authController, 'login').mockResolvedValue(undefined);

      const shouldBeUndefined = await authController.login(loginDto, response);

      expect(authController.login).toBeCalled();
      expect(authController.login).toBeCalledWith(loginDto, response);

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return exception if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'not_exist_user_id',
        password: 'password',
      };

      jest
        .spyOn(authController, 'login')
        .mockRejectedValue(new NotFoundException());

      await expect(
        authController.login(loginDto, response),
      ).rejects.toThrowError(new NotFoundException());
    });

    it('should return exception if password is wrong', async () => {
      const loginDto = {
        user_idOrEmail: user_1,
        password: 'wrong_password',
      };

      jest
        .spyOn(authController, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        authController.login(loginDto, response),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should refresh token', async () => {
      const userPayload = {
        id: 'id_1',
        email: 'user_1@gmail.com',
        user_id: user_1,
        username: 'username_1',
        iat: 1,
        exp: 1,
      };

      jest.spyOn(authController, 'refreshToken').mockResolvedValue(undefined);

      const shouldBeUndefined = await authController.refreshToken(
        userPayload,
        response,
      );

      expect(authController.refreshToken).toBeCalled();
      expect(authController.refreshToken).toBeCalledWith(userPayload, response);

      expect(shouldBeUndefined).toBeUndefined();
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

    afterAll(async () => {
      await redisService.quit();
    });
  });

  describe('Integration Test', () => {
    let emailService: EmailService;
    let otpService: OtpService;
    let redisService: RedisService;
    let prismaService: PrismaService;
    let jwtService: JwtService;
    let authController: AuthController;

    const user_1 = 'user_1';

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

      prismaService = module.get<PrismaService>(PrismaService);
      emailService = module.get<EmailService>(EmailService);
      otpService = module.get<OtpService>(OtpService);
      redisService = module.get<RedisService>(RedisService);
      jwtService = module.get<JwtService>(JwtService);
      authController = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
      expect(authController).toBeDefined();
    });

    it('should return tokens when sign up and user should be created', async () => {
      const signUpDto = {
        user_id: user_1,
        username: 'username_1',
        password: 'password',
        email: 'user_1@gmail.com',
      };

      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);
      jest
        .spyOn(AuthController.prototype as any, 'sentCookie')
        .mockResolvedValue(undefined);

      const otp = await otpService.generateOtp(signUpDto.email);

      const shouldBeUndefined = await authController.signUp(
        signUpDto,
        otp,
        response,
      );

      const user = await prismaService.users.findFirst({
        where: { username: signUpDto.username },
      });

      expect(user).toBeDefined();

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return tokens when login', async () => {
      const loginDto = {
        user_idOrEmail: user_1,
        password: 'password',
      };

      const shouldBeUndefined = await authController.login(loginDto, response);

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return exception if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'not_exist_user_id',
        password: 'password',
      };

      await expect(
        authController.login(loginDto, response),
      ).rejects.toThrowError();
    });

    it('should return exception if password is wrong', async () => {
      const loginDto = {
        user_idOrEmail: user_1,
        password: 'wrong_password',
      };

      await expect(
        authController.login(loginDto, response),
      ).rejects.toThrowError();
    });

    it('should refresh token', async () => {
      const userPayload = {
        id: 'id_1',
        email: 'user_1@gmail.com',
        user_id: user_1,
        username: 'username_1',
        iat: 1,
        exp: 1,
      };

      const shouldBeUndefined = await authController.refreshToken(
        userPayload,
        response,
      );

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return true if token is valid', async () => {
      const user = await prismaService.users.findFirst({
        where: {
          user_id: user_1,
        },
      });

      const userPayload = {
        id: user.id,
        email: 'user_1@gmail.com',
        user_id: user_1,
        username: 'username_1',
      };

      const token = await jwtService.signAsync(userPayload, {
        secret: process.env.JWT_SECRET,
      });

      const isVerified = await authController.verifyTahcuToken(token);

      expect(isVerified).toBeTruthy();
    });

    it('should return false if token is empty string', async () => {
      const isVerified = await authController.verifyTahcuToken(undefined);

      expect(isVerified).toBeFalsy();
    });

    it('should return false if token is valid but user is not found', async () => {
      const userPayload = {
        id: 'not_exist_id',
        email: 'not_exist_user@gmail.com',
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

    afterAll(async () => {
      await prismaService.$transaction([
        prismaService.users.deleteMany({
          where: {
            user_id: user_1,
          },
        }),
      ]);

      await redisService.quit();
    });
  });
});
