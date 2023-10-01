import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import {
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';

describe('AuthController', () => {
  describe('Unit Testing', () => {
    let authController: AuthController;
    let authService: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      prismaService = new PrismaService();
      usersService = new UsersService(prismaService);
      jwtService = new JwtService();

      authService = new AuthService(usersService, jwtService);
      authController = new AuthController(authService);
    });

    it('should be defined', () => {
      expect(authController).toBeDefined();
    });

    it('should login', async () => {
      const loginDto = {
        user_idOrEmail: 'tes123',
        password: 'password',
      };

      const mockResponse = {
        cookie: jest.fn() as any,
      } as Response;

      jest.spyOn(authService, 'login').mockResolvedValue(undefined);

      const loggedIn = await authController.login(loginDto, mockResponse);

      expect(authService.login).toBeCalled();
      expect(authService.login).toBeCalledWith(loginDto);

      expect(loggedIn).toBeUndefined();
    });

    it('should return exception if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'tess123',
        password: 'password',
      };

      const mockResponse = {
        cookie: jest.fn() as any,
      } as Response;

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new NotFoundException());

      await expect(
        authController.login(loginDto, mockResponse),
      ).rejects.toThrowError(new NotFoundException());
    });

    it('should return exception if password is wrong', async () => {
      const loginDto = {
        user_idOrEmail: 'tes123',
        password: 'passwords',
      };

      const mockResponse = {
        cookie: jest.fn() as any,
      } as Response;

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        authController.login(loginDto, mockResponse),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should sign up', async () => {
      const signUpDto = {
        user_id: 'tes123',
        username: 'tes123',
        password: 'password',
        email: 'tes@gmail.com',
        is_active: true,
      };

      const mockResponse = {
        cookie: jest.fn() as any,
      } as Response;

      jest.spyOn(authService, 'signUp').mockResolvedValue(undefined);

      const signUp = await authController.signUp(signUpDto, mockResponse);

      expect(authService.signUp).toBeCalled();
      expect(authService.signUp).toBeCalledWith(signUpDto);

      expect(signUp).toBeUndefined();
    });

    it('should retrun exception if sign up dto is not valid', async () => {
      const signUpDto = {
        user_id: '',
        username: '',
        password: '',
        email: '',
        is_active: undefined,
      };

      const mockResponse = {
        cookie: jest.fn() as any,
      } as Response;

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new BadRequestException());

      await expect(
        authController.signUp(signUpDto, mockResponse),
      ).rejects.toThrowError(new BadRequestException());
    });
  });

  describe('Integration Testing', () => {
    let authController: AuthController;
    let usersService: UsersService;

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
        ],
        providers: [AuthService],
        controllers: [AuthController],
      }).compile();

      usersService = module.get<UsersService>(UsersService);

      authController = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
      expect(authController).toBeDefined();
    });

    it('should sign up', async () => {
      const signUpDto = {
        user_id: 'tes123',
        username: 'tes123',
        password: 'password',
        email: 'tes@gmail.com',
        is_active: true,
      };

      const mockResponse = {
        cookie: jest.fn() as any,
      } as Response;

      await authController.signUp(signUpDto, mockResponse);

      const user = await usersService.findOneEmail(signUpDto.email);

      expect(user.email).toBe(signUpDto.email);
      expect(user.user_id).toBe(signUpDto.user_id);
      expect(user.is_active).toBe(signUpDto.is_active);
      expect(user.username).toBe(signUpDto.username);
    });

    it('should login', async () => {
      const loginDto = {
        user_idOrEmail: 'tes123',
        password: 'password',
      };

      const mockResponse = {
        cookie: jest.fn() as any,
      } as Response;

      expect(
        await authController.login(loginDto, mockResponse),
      ).toBeUndefined();
    });

    it('should throw not found if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'tess123',
        password: 'password',
      };

      const mockResponse = {
        cookie: jest.fn() as any,
      } as Response;

      await expect(
        authController.login(loginDto, mockResponse),
      ).rejects.toThrowError(
        new NotFoundException({
          error: 'User not found',
          meta: {
            user: 'User Not Found',
          },
        }),
      );
    });

    it('should throw unauthorized if password is wrong', async () => {
      const loginDto = {
        user_idOrEmail: 'tes123',
        password: 'passworda',
      };

      const mockResponse = {
        cookie: jest.fn() as any,
      } as Response;

      await expect(
        authController.login(loginDto, mockResponse),
      ).rejects.toThrowError(
        new UnauthorizedException({
          error: 'Unauthorized',
          meta: {
            password: 'Wrong password',
          },
        }),
      );
    });

    afterAll(async () => {
      const prismaService = new PrismaService();
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
