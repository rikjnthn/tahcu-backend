import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

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

    it('should return true if user is authorized in http connection', async () => {
      const { is_active, ...payload } = await usersService.create({
        email: 'nina@gmail.com',
        is_active: true,
        password: 'password',
        user_id: 'nina123',
        username: 'nina123',
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
        getType: () => {
          return 'http';
        },
      } as ExecutionContext;

      const isPass = await authGuard.canActivate(contextMock);

      expect(isPass).toBeTruthy();
    });

    it('should return true if user is authorized in ws connection', async () => {
      const { is_active, ...payload } = await usersService.create({
        email: 'dono@gmail.com',
        is_active: true,
        password: 'password',
        user_id: 'dono123',
        username: 'dono123',
      });

      const token = await jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      });

      const contextMock = {
        switchToWs: () => {
          return {
            getClient() {
              return {
                handshake: {
                  cookies: {
                    access_token: token,
                  },
                  headers: {
                    user: {},
                  },
                },
              };
            },
          };
        },
        getType: () => 'ws',
      } as ExecutionContext;

      const isPass = await authGuard.canActivate(contextMock);

      expect(isPass).toBeTruthy();
    });

    it('should return false if token not valid in http connection', async () => {
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
        getType: () => 'http',
      } as ExecutionContext;

      await expect(authGuard.canActivate(contextMock)).rejects.toThrowError(
        new UnauthorizedException(),
      );
    });

    it('should return false if token not valid in ws connection', async () => {
      const contextMock = {
        switchToWs: () => {
          return {
            getClient() {
              return {
                handshake: {
                  cookies: {
                    access_token: 'false token',
                  },
                },
              };
            },
          };
        },

        getType: () => 'ws',
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
