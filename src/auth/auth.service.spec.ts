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
import { AuthReturnType } from './interface/auth.interface';
import { OtpModule } from 'src/common/otp/otp.module';
import { EmailModule } from 'src/common/email/email.module';
import { ThrottlerModule } from '@nestjs/throttler';

describe('AuthService', () => {
  describe('Unit Test', () => {
    let authService: AuthService;
    let redisService: RedisService;
    let otpService: OtpService;
    let emailService: EmailService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let prismaService: PrismaService;

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
    });

    it('should be defined', () => {
      expect(authService).toBeDefined();
    });

    it('should return tokens when sign up', async () => {
      const signUpDto = {
        user_id: user_1,
        username: 'username_1',
        password: 'password',
        email: 'user_1@gmail.com',
      };

      const mockTokens = ['tahcu_authToken', 'CSRF_TOKEN'] as AuthReturnType;

      jest.spyOn(authService, 'signUp').mockResolvedValue(mockTokens);

      const otp = '1234';

      const tokens = await authService.signUp(signUpDto, otp);

      expect(authService.signUp).toBeCalled();
      expect(authService.signUp).toBeCalledWith(signUpDto, otp);

      expect(tokens).toEqual(mockTokens);
    });

    it('should return tokens when login', async () => {
      const loginDto = {
        user_idOrEmail: user_1,
        password: 'password',
      };

      const mockTokens = ['tahcu_authToken', 'CSRF_TOKEN'] as AuthReturnType;

      jest.spyOn(authService, 'login').mockResolvedValue(mockTokens);

      const tokens = await authService.login(loginDto);

      expect(authService.login).toBeCalled();
      expect(authService.login).toBeCalledWith(loginDto);

      expect(tokens).toEqual(mockTokens);
    });

    it('should return exception if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'not_exist_user_id',
        password: 'password',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new NotFoundException());

      await expect(authService.login(loginDto)).rejects.toThrowError(
        new NotFoundException(),
      );
    });

    it('should return exception if password is wrong', async () => {
      const loginDto = {
        user_idOrEmail: user_1,
        password: 'wrong_password',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authService.login(loginDto)).rejects.toThrowError(
        new UnauthorizedException(),
      );
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

      const tokens = ['new_tahcu_token', 'new_csrf_token'] as AuthReturnType;

      jest.spyOn(authService, 'refreshToken').mockResolvedValue(tokens);

      const shouldBeUndefined = await authService.refreshToken(userPayload);

      expect(authService.refreshToken).toBeCalled();
      expect(authService.refreshToken).toBeCalledWith(userPayload);

      expect(shouldBeUndefined).toEqual(tokens);
    });

    it('should return true if token is valid', async () => {
      jest.spyOn(authService, 'verifyTahcuToken').mockResolvedValue(true);

      const isVerified = await authService.verifyTahcuToken('tahcu_authToken');

      expect(authService.verifyTahcuToken).toBeCalled();
      expect(authService.verifyTahcuToken).toBeCalledWith('tahcu_authToken');

      expect(isVerified).toBeTruthy();
    });

    it('should return false if token is valid but user is not found', async () => {
      jest.spyOn(authService, 'verifyTahcuToken').mockResolvedValue(false);

      const isVerified = await authService.verifyTahcuToken(
        'valid_token_but_user_not_found',
      );

      expect(authService.verifyTahcuToken).toBeCalled();
      expect(authService.verifyTahcuToken).toBeCalledWith(
        'valid_token_but_user_not_found',
      );

      expect(isVerified).toBeFalsy();
    });

    it('should return false if token is empty string', async () => {
      jest.spyOn(authService, 'verifyTahcuToken').mockResolvedValue(false);

      const isVerified = await authService.verifyTahcuToken('');

      expect(authService.verifyTahcuToken).toBeCalled();
      expect(authService.verifyTahcuToken).toBeCalledWith('');

      expect(isVerified).toBeFalsy();
    });

    it('should return false if token is not valid', async () => {
      jest.spyOn(authService, 'verifyTahcuToken').mockResolvedValue(false);

      const isVerified = await authService.verifyTahcuToken('not_valid_token');

      expect(authService.verifyTahcuToken).toBeCalled();
      expect(authService.verifyTahcuToken).toBeCalledWith('not_valid_token');

      expect(isVerified).toBeFalsy();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });

  describe('Integration Test', () => {
    let authService: AuthService;
    let emailService: EmailService;
    let otpService: OtpService;
    let redisService: RedisService;
    let jwtService: JwtService;
    let prismaService: PrismaService;

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
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      emailService = module.get<EmailService>(EmailService);
      otpService = module.get<OtpService>(OtpService);
      redisService = module.get<RedisService>(RedisService);
      jwtService = module.get<JwtService>(JwtService);
      authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
      expect(authService).toBeDefined();
    });

    it('should return tokens when sign up and user should be created', async () => {
      const signUpDto = {
        user_id: user_1,
        username: 'username_1',
        password: 'password',
        email: 'user_1@gmail.com',
      };

      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);

      const otp = await otpService.generateOtp(signUpDto.email);

      const tokens = await authService.signUp(signUpDto, otp);

      const user = await prismaService.users.findFirst({
        where: { username: signUpDto.username },
      });

      expect(user).toBeDefined();

      expect(Array.isArray(tokens)).toBeTruthy();
      expect(tokens.length).toEqual(2);

      tokens.forEach((token) => {
        expect(typeof token).toEqual('string');
      });
    });

    it('should return tokens when login', async () => {
      const loginDto = {
        user_idOrEmail: user_1,
        password: 'password',
      };

      const tokens = await authService.login(loginDto);

      expect(Array.isArray(tokens)).toBeTruthy();
      expect(tokens.length).toEqual(2);

      tokens.forEach((token) => {
        expect(typeof token).toEqual('string');
      });
    });

    it('should return exception if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'not_exist_user_id',
        password: 'password',
      };

      await expect(authService.login(loginDto)).rejects.toThrowError();
    });

    it('should return exception if password is wrong', async () => {
      const loginDto = {
        user_idOrEmail: user_1,
        password: 'wrong_password',
      };

      await expect(authService.login(loginDto)).rejects.toThrowError();
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

      const tokens = await authService.refreshToken(userPayload);

      expect(Array.isArray(tokens)).toBeTruthy();
      expect(tokens.length).toEqual(2);

      tokens.forEach((token) => {
        expect(typeof token).toEqual('string');
      });
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

      const isVerified = await authService.verifyTahcuToken(token);

      expect(isVerified).toBeTruthy();
    });

    it('should return false if token is empty string', async () => {
      const isVerified = await authService.verifyTahcuToken(undefined);

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

      const isVerified = await authService.verifyTahcuToken(token);

      expect(isVerified).toBeFalsy();
    });

    it('should return false if token is not valid', async () => {
      const isVerified = await authService.verifyTahcuToken('not_valid_token');

      expect(isVerified).toBeFalsy();
    });

    afterAll(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);

      await redisService.quit();
    });
  });
});
