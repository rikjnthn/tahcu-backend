import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { io } from 'socket.io-client';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

import { MessageService } from './message.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MessageGateway } from './message.gateway';
import { AuthGuard } from 'src/auth/auth.guard';

describe('MessageGateway', () => {
  describe('Integration Testing', () => {
    let messageGateway: MessageGateway;
    let prismaService: PrismaService;

    const user_1 = 'user_1';
    const user_2 = 'user_2';
    const user_3 = 'user_3';

    let contact_id: string;
    let group_id: string;
    let app: INestApplication;

    contact_id;
    group_id;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          PrismaModule,
          JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {
              expiresIn: process.env.JWT_EXPIRED,
            },
          }),
          ThrottlerModule.forRoot([
            {
              ttl: parseInt(process.env.DEFAULT_THROTTLER_TTL),
              limit: parseInt(process.env.DEFAULT_THROTTLER_LIMIT),
            },
          ]),
        ],
        providers: [MessageService, MessageGateway],
      })
        .overrideGuard(AuthGuard)
        .useValue({ canActivate: async () => true })
        .compile();
      app = module.createNestApplication();
      app.useWebSocketAdapter(new IoAdapter());
      app.listen(3000);
      await app.init();
      prismaService = app.get(PrismaService);
      messageGateway = app.get(MessageGateway);
    });

    beforeEach(async () => {
      await prismaService.$transaction(async (ctx) => {
        await ctx.users.create({
          data: {
            email: 'user_1@gmail.com',
            password: 'password',
            user_id: user_1,
            username: 'username_1',
          },
        });
        await ctx.users.create({
          data: {
            email: 'user_2@gmail.com',
            password: 'password',
            user_id: user_2,
            username: 'username_2',
          },
        });
        await ctx.users.create({
          data: {
            email: 'user_3@gmail.com',
            password: 'password',
            user_id: user_3,
            username: 'username_3',
          },
        });
        const contact = await ctx.contact.create({
          data: {
            user_id: user_1,
            friends_id: user_2,
          },
        });
        contact_id = contact.id;
        const group = await ctx.group.create({
          data: {
            name: 'Group_1',
            admin_id: user_1,
            created_by_id: user_1,
            group_membership: {
              createMany: {
                data: [
                  { user_id: user_1 },
                  { user_id: user_2 },
                  { user_id: user_3 },
                ],
              },
            },
          },
        });
        group_id = group.id;
      });
    });

    afterEach(async () => {
      await prismaService.$transaction([
        prismaService.users.deleteMany(),
        prismaService.group.deleteMany(),
        prismaService.groupMembership.deleteMany(),
        prismaService.message.deleteMany(),
        prismaService.contact.deleteMany(),
      ]);
    });

    const socket = io('http://localhost:3000/message', {
      autoConnect: false,
      path: '/message',
    });

    beforeEach(() => {
      socket.connect();
    });

    afterEach(() => {
      socket.disconnect();
    });

    it('should be defined', () => {
      expect(messageGateway).toBeDefined();
    });
    //     it.only('should create private message and return record', async () => {
    //       const createMessageDto = {
    //         sender_id: user_1,
    //         contact_id,
    //         message: 'message',
    //       };
    //       console.log(socket.connected);
    //       socket.emit('join-room', { ids: [contact_id] });
    //       socket.emit('create', { chat_id: contact_id, data: createMessageDto });
    //       await new Promise((res) => {
    //         socket.on('message', (message) => {
    //           expect(message.message).toBe(createMessageDto.message);
    //           expect(message.contact_id).toBe(createMessageDto.contact_id);
    //           expect(message.sender_id).toBe(createMessageDto.sender_id);
    //           console.log(message);
    //           res(null);
    //           socket.off('message');
    //         });
    //       });
    //     });
    //     it('should create group message and return record', async () => {
    //       const createMessageDto = {
    //         sender_id: user_1,
    //         group_id,
    //         message: 'message',
    //       };
    //       await messageGateway.create(group_id, createMessageDto);
    //       socket.on('message', (message) => {
    //         expect(message.message).toBe(createMessageDto.message);
    //         expect(message.contact_id).toBe(createMessageDto.group_id);
    //         expect(message.sender_id).toBe(createMessageDto.sender_id);
    //       });
    //       socket.off('message');
    //     });
    //     it('should return exception if contact id not found when create message', async () => {
    //       const createMessageDto = {
    //         sender_id: user_1,
    //         contact_id: 'not_exist_contact_id',
    //         message: 'messsage',
    //       };
    //       await expect(
    //         messageGateway.create(createMessageDto.contact_id, createMessageDto),
    //       ).rejects.toThrow(
    //         new WsException({
    //           error: {
    //             code: 'NOT_FOUND',
    //             message: 'contact_id was not found',
    //           },
    //         }),
    //       );
    //     });
    //     it('should return exception if sender id not found when create message', async () => {
    //       const createMessageDto = {
    //         sender_id: 'not_exist_user_id',
    //         contact_id,
    //         message: 'messsage',
    //       };
    //       await expect(
    //         messageGateway.create(createMessageDto.contact_id, createMessageDto),
    //       ).rejects.toThrow(
    //         new WsException({
    //           error: {
    //             code: 'NOT_FOUND',
    //             message: 'sender_id was not found',
    //           },
    //         }),
    //       );
    //     });
    //     it('should return exception if group id not found when create message', async () => {
    //       const createMessageDto = {
    //         sender_id: user_1,
    //         group_id: 'not_exist_group_id',
    //         message: 'message',
    //       };
    //       await expect(
    //         messageGateway.create(createMessageDto.group_id, createMessageDto),
    //       ).rejects.toThrow(
    //         new WsException({
    //           error: {
    //             code: 'NOT_FOUND',
    //             message: 'group_id was not found',
    //           },
    //         }),
    //       );
    //     });
    //     it('should return exception if group id and contact id both were given when create message', async () => {
    //       const createMessageDto = {
    //         sender_id: user_1,
    //         group_id,
    //         contact_id,
    //         message: 'message',
    //       };
    //       await expect(
    //         messageGateway.create(createMessageDto.contact_id, createMessageDto),
    //       ).rejects.toThrow(
    //         new WsException({
    //           error: {
    //             code: 'VALIDATION_ERROR',
    //             message:
    //               'Either a contact id or a group id should be provided, not both',
    //           },
    //         }),
    //       );
    //     });
    //     it('should update message and return record', async () => {
    //       const message = await prismaService.message.create({
    //         data: {
    //           contact_id,
    //           sender_id: user_1,
    //           message: 'message',
    //         },
    //       });
    //       const updateMessageDto = {
    //         id: message.id,
    //         message: 'change message',
    //       };
    //       await messageGateway.update(contact_id, updateMessageDto);
    //       socket.on('updated-message', (message) => {
    //         expect(message.message).toEqual(updateMessageDto.message);
    //       });
    //       socket.off('updateed-message');
    //     });
    //     it('should find all message', async () => {
    //       await prismaService.message.create({
    //         data: {
    //           contact_id,
    //           sender_id: user_1,
    //           message: 'message',
    //         },
    //       });
    //       const FindMessageDto = {
    //         contact_id,
    //         skip: 0,
    //       };
    //       const [message] = await messageGateway.findAll(FindMessageDto);
    //       expect(message.message).toEqual('message');
    //     });
    //     it('should return empty array if message not found', async () => {
    //       const FindMessageDto = {
    //         group_id,
    //         skip: 0,
    //       };
    //       const messageFound = await messageGateway.findAll(FindMessageDto);
    //       expect(messageFound).toEqual([]);
    //     });
    //     it('should remove message', async () => {
    //       const message = await prismaService.message.create({
    //         data: {
    //           contact_id,
    //           sender_id: user_1,
    //           message: 'message',
    //         },
    //       });
    //       await messageGateway.remove(contact_id, { ids: [message.id] });
    //       socket.on('deleted-message', (message) => {
    //         expect(message).toBeDefined();
    //       });
    //       await expect(
    //         prismaService.message.findFirst({
    //           where: {
    //             id: message.id,
    //           },
    //         }),
    //       ).resolves.toBeNull();
    //     });
    //     it('should return void if message that need to be remove not found', async () => {
    //       await expect(
    //         messageGateway.remove('', { ids: ['not_exist_message_id'] }),
    //       ).resolves.toBeUndefined();
    //     });
    afterAll(async () => {
      await prismaService.$transaction([
        prismaService.message.deleteMany({}),
        prismaService.contact.deleteMany({}),
        prismaService.group.deleteMany({}),
        prismaService.users.deleteMany({}),
      ]);
      await app.close();
      socket.close();
    });
  });
});
