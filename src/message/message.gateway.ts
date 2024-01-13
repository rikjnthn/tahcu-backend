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

import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaKnownErrorWebsocket } from 'src/common/filter/prisma-known-error-websocket.filter';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { AuthGuard } from 'src/auth/auth.guard';
import { FindMessageDto } from './dto/find-messages.dto';
import validationExceptionFactory from 'src/common/helper/validation-exception-factory';
import { MessageType } from './interface/message.interface';

@WebSocketGateway(8081, {
  transports: ['websocket'],
  path: '/message/socket.io',
  namespace: 'message',
})
@UseFilters(PrismaKnownErrorWebsocket, WsExceptionFilter)
@UseGuards(AuthGuard)
@UsePipes(
  new ValidationPipe({
    exceptionFactory: validationExceptionFactory,
  }),
)
export class MessageGateway implements OnGatewayConnection {
  constructor(private readonly messageService: MessageService) {}

  @SubscribeMessage('create')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
  ): Promise<MessageType> {
    return await this.messageService.create(createMessageDto);
  }

  @SubscribeMessage('find-all')
  async findAll(
    @MessageBody() findMessageDto: FindMessageDto,
  ): Promise<MessageType[]> {
    return await this.messageService.findAll(findMessageDto);
  }

  @SubscribeMessage('update')
  async update(
    @MessageBody('id') id: string,
    @MessageBody('message') updateMessageDto: UpdateMessageDto,
  ): Promise<MessageType> {
    return await this.messageService.update(id, updateMessageDto);
  }

  @SubscribeMessage('remove')
  async remove(@MessageBody('id') id: string[]): Promise<void> {
    return await this.messageService.remove(id);
  }

  handleConnection(client: Socket): void {
    const request = client.handshake;

    const cookie = request.headers.cookie;
    const tahcu_auth = parse(cookie).tahcu_auth;

    request['cookies'] = JSON.parse(tahcu_auth);
  }
}
