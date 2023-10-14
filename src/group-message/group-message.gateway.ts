import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { parse } from 'cookie';

import { GroupMessageService } from './group-message.service';
import { PrismaKnownErrorWebsocket } from 'src/common/filter/prisma-known-error-websocket.filter';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { AuthGuard } from 'src/auth/auth.guard';
import validationExceptionFactory from 'src/common/helper/validation-exception-factory';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { FindGroupMessageDto } from './dto/find-group-message.dto';
import { User } from 'src/common/decorator/User.decorator';
import { UpdateGroupMessageDto } from './dto/update-group-message.dto';

@WebSocketGateway(8080, {
  transports: ['websocket'],
  path: '/group-message/socket.io',
  namespace: 'group-message',
})
@UseFilters(PrismaKnownErrorWebsocket, WsExceptionFilter)
@UseGuards(AuthGuard)
@UsePipes(
  new ValidationPipe({
    exceptionFactory: validationExceptionFactory,
  }),
)
export class GroupMessageGateway implements OnGatewayConnection {
  constructor(private readonly groupMessageService: GroupMessageService) {}

  @SubscribeMessage('create')
  async create(
    @MessageBody() createGroupMessageDto: CreateGroupMessageDto,
    @User('id') userId: string,
  ) {
    return await this.groupMessageService.create(createGroupMessageDto, userId);
  }

  @SubscribeMessage('find-all')
  async findAll(@MessageBody() findGroupMessageDto: FindGroupMessageDto) {
    return await this.groupMessageService.findAll(findGroupMessageDto);
  }

  @SubscribeMessage('update')
  async update(@MessageBody() updateGroupMessageDto: UpdateGroupMessageDto) {
    return await this.groupMessageService.update(updateGroupMessageDto);
  }

  @SubscribeMessage('delete')
  async delete(
    @MessageBody('ids') ids: string[],
    @MessageBody('group_id') groupId: string,
  ) {
    return this.groupMessageService.delete(ids, groupId);
  }

  handleConnection(client: Socket) {
    const request = client.handshake;

    const cookie = request.headers.cookie;
    const tahcu_auth = parse(cookie).tahcu_auth;

    request['cookies'] = JSON.parse(tahcu_auth);
  }
}
