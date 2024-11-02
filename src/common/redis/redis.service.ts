import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService
  extends Redis
  implements OnModuleDestroy, OnModuleInit
{
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    super({
      port: parseInt(process.env.DRAGONFLY_PORT),
      host: process.env.DRAGONFLY_HOST,
    });
  }

  onModuleInit() {
    this.logger.log('Initialized redis connection');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Close redis connection');

    await this.quit();
  }
}
