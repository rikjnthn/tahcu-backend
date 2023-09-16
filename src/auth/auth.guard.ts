import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Socket } from 'socket.io';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return context.getType() === 'http'
      ? this.handleHttp(context)
      : this.handleWs(context);
  }

  async handleHttp(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.cookies?.tahcu_auth?.access_token;

    const payload = await this.verifyJwt(token);

    request.user = payload;

    return true;
  }

  async handleWs(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>();

    const token = client.handshake['cookies'].access_token;

    const payload = await this.verifyJwt(token);

    client.handshake.headers.user = payload;

    return true;
  }

  async verifyJwt(token: string) {
    if (!token) throw new UnauthorizedException();
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
