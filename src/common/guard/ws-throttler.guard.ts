import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';
import { Socket } from 'socket.io';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: ThrottlerOptions,
  ): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const ip = client.conn.remoteAddress;
    const key = this.generateKey(context, ip, throttler.name);

    const { totalHits } = await this.storageService.increment(key, ttl);

    if (totalHits > limit)
      throw new HttpException(
        {
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests were made to the server',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );

    return true;
  }
}
