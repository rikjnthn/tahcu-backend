import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';

describe('AuthService', () => {
  describe('Unit Test', () => {
    let authService: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      jwtService = new JwtService();
      prismaService = new PrismaService();
      usersService = new UsersService(prismaService);

      authService = new AuthService(usersService, jwtService);
    });

    it('should return object of access token when login', async () => {
      const loginDto = {
        user_idOrEmail: 'tes123',
        password: 'password',
      };

      const mockObjectAcessToken = {
        access_token: 'accesstoken',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockObjectAcessToken);

      const access_tokenObject = await authService.login(loginDto);

      expect(authService.login).toBeCalled();
      expect(authService.login).toBeCalledWith(loginDto);

      expect(access_tokenObject).toEqual(mockObjectAcessToken);
    });

    it('should return exception if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'tess123',
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
        user_idOrEmail: 'tes123',
        password: 'passwords',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authService.login(loginDto)).rejects.toThrowError(
        new UnauthorizedException(),
      );
    });

    it('should return object of access_token when sign up', async () => {
      const signUpDto = {
        user_id: 'tes123',
        username: 'tes123',
        password: 'password',
        email: 'tes@gmail.com',
        is_active: true,
      };

      const mockObjectAcessToken = {
        access_token: 'accesstoken',
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(mockObjectAcessToken);

      const signUp = await authService.signUp(signUpDto);

      expect(authService.signUp).toBeCalled();
      expect(authService.signUp).toBeCalledWith(signUpDto);

      expect(signUp).toEqual(mockObjectAcessToken);
    });

    it('should retrun exception if sign up dto is not valid', async () => {
      const signUpDto = {
        user_id: '',
        username: '',
        password: '',
        email: '',
        is_active: undefined,
      };

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new BadRequestException());

      await expect(authService.signUp(signUpDto)).rejects.toThrowError(
        new BadRequestException(),
      );
    });

    it('should validate user and return token', async () => {
      const validateUsersParam = {
        user_idOrEmail: 'tes123',
        password: 'password',
      };

      const mockObjectAccessToken = { access_token: 'accesstoken' };

      jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue(mockObjectAccessToken);

      const objectAccessToken = await authService.validateUser(
        validateUsersParam,
      );

      expect(authService.validateUser).toBeCalled();
      expect(authService.validateUser).toBeCalledWith(validateUsersParam);

      expect(objectAccessToken).toEqual(mockObjectAccessToken);
    });

    it('should retrun exception if user is not found', async () => {
      const validateUsersParam = {
        user_idOrEmail: 'tess123',
        password: 'password',
      };

      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(new BadRequestException());

      await expect(
        authService.validateUser(validateUsersParam),
      ).rejects.toEqual(new BadRequestException());
    });

    it('should retrun exception if password is wrong', async () => {
      const validateUsersParam = {
        user_idOrEmail: 'tes123',
        password: 'passwosrd',
      };

      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        authService.validateUser(validateUsersParam),
      ).rejects.toEqual(new UnauthorizedException());
    });
  });

  describe('Integration Test', () => {
    let authService: AuthService;
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
      }).compile();

      usersService = module.get<UsersService>(UsersService);
      authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
      expect(authService).toBeDefined();
    });

    it('should return object of access token when sign up and user should be created', async () => {
      const signUpDto = {
        user_id: 'tes123',
        username: 'tes123',
        password: 'password',
        email: 'tes@gmail.com',
        is_active: true,
      };

      const access_tokenObject = await authService.signUp(signUpDto);

      const user = await usersService.findOneId(signUpDto.user_id);

      expect(user).toBeDefined();
      expect(access_tokenObject.access_token).toBeDefined();
    });

    it('should return object of access token when login', async () => {
      const loginDto = {
        user_idOrEmail: 'tes123',
        password: 'password',
      };

      const access_tokenObject = await authService.login(loginDto);

      expect(access_tokenObject.access_token).toBeDefined();
    });

    it('should return exception if user not found', async () => {
      const loginDto = {
        user_idOrEmail: 'tess123',
        password: 'password',
      };

      await expect(authService.login(loginDto)).rejects.toThrowError(
        new NotFoundException({
          error: 'User not found',
          meta: {
            user: 'User Not Found',
          },
        }),
      );
    });

    it('should return exception if password is wrong', async () => {
      const loginDto = {
        user_idOrEmail: 'tes123',
        password: 'passwords',
      };

      await expect(authService.login(loginDto)).rejects.toThrowError(
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
