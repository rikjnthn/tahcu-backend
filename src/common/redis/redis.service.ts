import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor() {
    super({
      port: parseInt(process.env.DRAGONFLY_PORT),
      host: process.env.DRAGONFLY_HOST,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.quit();
  }
}
