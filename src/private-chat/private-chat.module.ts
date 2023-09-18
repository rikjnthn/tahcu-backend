import { Module } from '@nestjs/common';
import { PrivateChatService } from './private-chat.service';
import { PrivateChatController } from './private-chat.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PrivateChatController],
  providers: [PrivateChatService],
})
export class PrivateChatModule {}
