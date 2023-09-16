import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MessageGateway, MessageService],
})
export class MessageModule {}
