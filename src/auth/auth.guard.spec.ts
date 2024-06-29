import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ExecutionContext } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';

describe('AuthGuard', () => {
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let redisService: RedisService;
  let authGuard: AuthGuard;

  beforeAll(async () => {
    prismaService = new PrismaService();
    jwtService = new JwtService();
    redisService = new RedisService();
    authGuard = new AuthGuard(jwtService, prismaService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('should return true if user is authorized in http connection', async () => {
    jest.spyOn(authGuard, 'canActivate').mockResolvedValue(true);

    const contextMock = {
      switchToHttp: () => {
        return {
          getRequest() {
            return {
              cookies: {
                tahcu_auth: 'token',
              },
            };
          },
        };
      },
      getType: () => {
        return 'http';
      },
    } as ExecutionContext;

    const isValid = await authGuard.canActivate(contextMock);

    expect(isValid).toBeTruthy();
  });

  it('should return true if user is authorized in ws connection', async () => {
    jest.spyOn(authGuard, 'canActivate').mockResolvedValue(true);

    const contextMock = {
      switchToWs: () => {
        return {
          getClient() {
            return {
              handshake: {
                cookies: {
                  tahcu_auth: 'token',
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

    const isValid = await authGuard.canActivate(contextMock);

    expect(isValid).toBeTruthy();
  });

  it('should return false if token not valid in http connection', async () => {
    jest
      .spyOn(authGuard, 'canActivate')
      .mockRejectedValue(new UnauthorizedException());

    const contextMock = {
      switchToHttp: () => {
        return {
          getRequest() {
            return {
              cookies: {
                tahcu_auth: 'false token',
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
    jest
      .spyOn(authGuard, 'canActivate')
      .mockRejectedValue(new UnauthorizedException());

    const contextMock = {
      switchToWs: () => {
        return {
          getClient() {
            return {
              handshake: {
                cookies: {
                  tahcu_auth: 'false token',
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

  afterAll(async () => {
    await redisService.quit();
  });
});
