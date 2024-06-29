import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Socket } from 'socket.io';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserPayloadType } from './interface/auth.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return context.getType() === 'http'
      ? this.handleHttp(context)
      : this.handleWs(context);
  }

  /**
   * Verify user that using http connection
   *
   * @param context nest js execution context
   *
   * @returns user validity
   */
  async handleHttp(context: ExecutionContext): Promise<boolean> {
    this.logger.log('Start authentication');

    const request = context.switchToHttp().getRequest<Request>();

    const token = request.cookies?.tahcu_auth;

    const payload = await this.verifyJwt(token);

    request['user'] = payload;

    this.logger.log('Authenticated');

    return true;
  }

  /**
   * Verify user that using websocket connection
   *
   * @param context nest js execution context
   *
   * @returns user validity
   */
  async handleWs(context: ExecutionContext): Promise<boolean> {
    this.logger.log('Start authentication');

    const client = context.switchToWs().getClient<Socket>();

    const token = client.handshake['cookies'].tahcu_auth;

    const payload = await this.verifyJwt(token);

    client.handshake.headers['user'] = payload as any;

    this.logger.log('Authenticated');

    return true;
  }

  /**
   * Verify user's session id (user's JWT token)
   *
   * @param token user's session id
   * @returns
   */
  async verifyJwt(token: string): Promise<UserPayloadType> {
    if (!token) {
      this.logger.warn('JWT token is not served');

      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No user token were given',
        },
      });
    }
    try {
      this.logger.log('Verifying JWT token');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      this.logger.log('Check if user exist');

      const user = await this.prismaService.users.findFirst({
        where: { id: payload.id },
      });

      if (!user) {
        this.logger.warn('User does not exist');

        throw new UnauthorizedException({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User token is not valid',
          },
        });
      }

      this.logger.log('JWT token verified');

      return payload;
    } catch {
      this.logger.warn('JWT token is not verified');

      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User token is not valid',
        },
      });
    }
  }
}
