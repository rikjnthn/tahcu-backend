import { Module } from '@nestjs/common';
import { GroupMessageService } from './group-message.service';
import { GroupMessageGateway } from './group-message.gateway';

@Module({
  providers: [GroupMessageGateway, GroupMessageService],
})
export class GroupMessageModule {}
