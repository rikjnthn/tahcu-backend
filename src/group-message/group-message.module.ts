import { Module } from '@nestjs/common';
import { GroupMessageService } from './group-message.service';
import { GroupMessageGateway } from './group-message.gateway';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GroupMessageGateway, GroupMessageService],
})
export class GroupMessageModule {}
