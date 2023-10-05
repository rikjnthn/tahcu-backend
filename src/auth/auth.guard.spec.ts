import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  describe('Unit Test', () => {
    let jwtService: JwtService;
    let usersService: UsersService;
    let prismaService: PrismaService;
    let authGuard: AuthGuard;

    beforeAll(async () => {
      prismaService = new PrismaService();
      jwtService = new JwtService();
      usersService = new UsersService(prismaService);
      authGuard = new AuthGuard(jwtService, usersService);
    });

    it('should be defined', () => {
      expect(authGuard).toBeDefined();
    });

    it('should return true if user is authorized', async () => {
      const { is_active, password, ...payload } = await usersService.create({
        email: 'tes@gmail.com',
        is_active: true,
        password: 'password',
        user_id: 'tes123',
        username: 'tes123',
      });

      const token = await jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      });

      const contextMock = {
        switchToHttp: () => {
          return {
            getRequest() {
              return {
                cookies: {
                  tahcu_auth: JSON.stringify({
                    access_token: token,
                  }),
                },
              };
            },
          };
        },
      } as ExecutionContext;

      const isPass = await authGuard.canActivate(contextMock);

      expect(isPass).toBeTruthy();
    });

    it('should return false if token not valid', async () => {
      const contextMock = {
        switchToHttp: () => {
          return {
            getRequest() {
              return {
                cookies: {
                  tahcu_auth: JSON.stringify({
                    access_token: 'false token',
                  }),
                },
              };
            },
          };
        },
      } as ExecutionContext;

      await expect(authGuard.canActivate(contextMock)).rejects.toThrowError(
        new UnauthorizedException(),
      );
    });

    afterAll(
      async () =>
        await prismaService.$transaction([prismaService.users.deleteMany()]),
    );
  });
});
