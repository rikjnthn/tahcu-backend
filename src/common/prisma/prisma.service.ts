import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    this.logger.log('Start prisma connection');

    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Close prisma connection');

    await this.$disconnect();
  }
}
