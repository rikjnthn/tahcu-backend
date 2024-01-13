import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Socket } from 'socket.io';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserPayload } from './interface/auth.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return context.getType() === 'http'
      ? this.handleHttp(context)
      : this.handleWs(context);
  }

  async handleHttp(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.cookies) throw new UnauthorizedException();

    const token = JSON.parse(request.cookies?.tahcu_auth);

    const payload = await this.verifyJwt(token);

    request['user'] = payload;

    return true;
  }

  async handleWs(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    if (!client.handshake['cookies']) throw new UnauthorizedException();

    const token = client.handshake['cookies'];

    const payload = await this.verifyJwt(token);

    client.handshake.headers['user'] = payload as any;

    return true;
  }

  async verifyJwt(token: string): Promise<UserPayload> {
    if (!token) throw new UnauthorizedException();
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prismaService.users.findFirst({
        where: { id: payload.id },
      });

      if (!user) throw new UnauthorizedException();

      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
