import {
  Logger,
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
  OnGatewayInit,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { seconds, Throttle } from '@nestjs/throttler';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';

import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { FindMessageDto } from './dto/find-messages.dto';
import validationExceptionFactory from 'src/common/helper/validation-exception-factory';
import { MessageType } from './interface/message.interface';
import { WsThrottlerGuard } from 'src/common/guard/ws-throttler.guard';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { messageWs } from 'src/common/middleware/message-ws.middleware';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthSocket } from 'src/common/interface/message-ws-middleware.interface';

@WebSocketGateway({
  path: '/message',
  namespace: 'message',
  cors: {
    origin: [process.env.ORIGIN_URL],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseFilters(WsExceptionFilter)
@UseGuards(WsThrottlerGuard)
@UsePipes(
  new ValidationPipe({
    exceptionFactory: validationExceptionFactory,
  }),
)
@Throttle({ default: { ttl: seconds(1), limit: 60 } })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessageGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private messageService: MessageService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  @SubscribeMessage('create')
  async create(
    @MessageBody('chat_id') chatId: string,
    @MessageBody('data') createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: AuthSocket,
  ): Promise<void> {
    const message = await this.messageService.create(
      createMessageDto,
      client.user.user_id,
    );
    this.server.to(chatId).emit('message', message);
  }

  @SubscribeMessage('find-all')
  async findAll(
    @MessageBody() findMessageDto: FindMessageDto,
  ): Promise<MessageType[]> {
    return await this.messageService.findAll(findMessageDto);
  }

  @SubscribeMessage('update')
  async update(
    @MessageBody('chat_id') chatId: string,
    @MessageBody('data') updateMessageDto: UpdateMessageDto,
  ): Promise<void> {
    const message = await this.messageService.update(updateMessageDto);

    this.server.to(chatId).emit('updated-message', message);
  }

  @SubscribeMessage('remove')
  async remove(
    @MessageBody('chat_id') chatId: string,
    @MessageBody('data') deleteMessageDto: DeleteMessageDto,
  ): Promise<void> {
    await this.messageService.remove(deleteMessageDto.ids);

    this.server.to(chatId).emit('deleted-message', deleteMessageDto.ids);
  }

  @SubscribeMessage('join-room')
  joinRoom(
    @MessageBody('ids') ids: string[],
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log('Join chat rooms');
    client.join(ids);
  }

  @SubscribeMessage('remove-room')
  removeRoom(@MessageBody('id') id: string, @ConnectedSocket() client: Socket) {
    this.logger.log('Leave chat room');
    client.leave(id);
  }

  afterInit(server: Server): void {
    this.logger.log('Websocket initialized');

    server.use(messageWs(this.jwtService, this.prismaService));
  }

  handleConnection(client: Socket): void {
    this.logger.log('Handle connection');

    const handshake = client.handshake;

    const cookies = cookie.parse(handshake.headers.cookie ?? '');

    const csrfTokenCookie = cookies.CSRF_TOKEN;
    const csrfTokenHeader = handshake.headers['x-csrf-token'];

    this.logger.log('validate CSRF_TOKEN');

    if (!csrfTokenCookie || !csrfTokenHeader) {
      this.logger.warn('Either one or both token is empty');

      this.server.emit('error', { error: { code: 'UNAUTHORIZED' } });
      client.disconnect();
      return;
    }

    if (csrfTokenCookie !== csrfTokenHeader) {
      this.logger.warn('CSRF_TOKEN is not valid');

      this.server.emit('error', { error: { code: 'UNAUTHORIZED' } });
      client.disconnect();
      return;
    }

    const tahcu_auth = cookies.tahcu_auth;

    handshake['cookies'] = { tahcu_auth };

    this.logger.log('CSRF_TOKEN valid');

    this.logger.log('Connected to socket');
  }

  handleDisconnect(): void {
    this.logger.log('Close websocket connection');
  }
}
