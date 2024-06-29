import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';

describe('MessageService', () => {
  describe('Unit Testing', () => {
    let messageService: MessageService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      prismaService = new PrismaService();
      messageService = new MessageService(prismaService);
    });

    it('should be defined', () => {
      expect(messageService).toBeDefined();
    });

    it('should create private message and return record', async () => {
      const createPrivateMessageDto = {
        sender_id: 'user_1',
        contact_id: 'contact_id_1',
        message: 'message',
      };

      const createdPrivateMessageMock = {
        id: 'message_id_1',
        message: 'message',
        contact_id: 'contact_id_1',
        group_id: '',
        sender: {
          username: 'username_1',
        },
        sender_id: 'user_1',
        sent_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(messageService, 'create')
        .mockResolvedValue(createdPrivateMessageMock);

      const createdPrivateMessage = await messageService.create(
        createPrivateMessageDto,
      );

      expect(messageService.create).toBeCalled();
      expect(messageService.create).toBeCalledWith(createPrivateMessageDto);

      expect(createdPrivateMessage).toEqual(createdPrivateMessageMock);
    });

    it('should create group message and return record', async () => {
      const createGroupMessageDto = {
        sender_id: 'user_1',
        group_id: 'group_id_1',
        message: 'message',
      };

      const createdGroupMessageMock = {
        id: 'message_id_1',
        message: 'message',
        contact_id: '',
        group_id: 'group_id_1',
        sender: {
          username: 'username_1',
        },
        sender_id: 'user_1',
        sent_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(messageService, 'create')
        .mockResolvedValue(createdGroupMessageMock);

      const createdGroupMessage = await messageService.create(
        createGroupMessageDto,
      );

      expect(messageService.create).toBeCalledWith(createGroupMessageDto);

      expect(createdGroupMessage).toEqual(createdGroupMessageMock);
    });

    it('should return exception if sender id not found when create message', async () => {
      const createMessageDto = {
        sender_id: 'not_exist_user_id',
        contact_id: 'contact_id_1',
        message: 'message',
      };

      jest.spyOn(messageService, 'create').mockRejectedValue(new Error());

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should return exception if contact id is not found when create message', async () => {
      const createMessageDto = {
        sender_id: 'user_1',
        contact_id: 'not_exist_contact_id',
        message: 'message',
      };

      jest.spyOn(messageService, 'create').mockRejectedValue(new Error());

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should return exception if group id not found when create message', async () => {
      const createMessageDto = {
        sender_id: 'user_1',
        group_id: 'not_exist_group_id',
        message: 'message',
      };

      jest.spyOn(messageService, 'create').mockRejectedValue(new Error());

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should return exception if group id and contact id both were given when create message', async () => {
      const createMessageDto = {
        sender_id: 'user_1',
        group_id: 'group_id_1',
        contact_id: 'contact_id_1',
        message: 'message',
      };

      jest.spyOn(messageService, 'create').mockRejectedValue(new Error());

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should update message and return record', async () => {
      const updateMessageDto = {
        id: 'message_id_1',
        message: 'new message',
      };

      const updatedMessageMock = {
        id: 'message_id_1',
        message: 'new message',
        group_id: '',
        contact_id: 'contact_id_1',
        sender_id: 'user_1',
        sender: {
          username: 'username_1',
        },
        sent_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(messageService, 'update')
        .mockResolvedValue(updatedMessageMock);

      const updatedMessage = await messageService.update(updateMessageDto);

      expect(messageService.update).toBeCalled();
      expect(messageService.update).toBeCalledWith(updateMessageDto);

      expect(updatedMessage).toEqual(updatedMessageMock);
    });

    it('should return exception if message id not found when update message', async () => {
      const updateMessageDto = {
        id: 'not_exist_message_id',
        message: 'new message',
      };

      jest.spyOn(messageService, 'update').mockRejectedValue(new Error());

      await expect(
        messageService.update(updateMessageDto),
      ).rejects.toThrowError();
    });

    it('should find all private messages', async () => {
      const FindMessageDto = {
        contact_id: 'contact_id_1',
      };

      const messageFoundMock = [
        {
          id: 'message_id_1',
          message: 'new message',
          group_id: '',
          contact_id: 'contact_id_1',
          sender_id: 'user_1',
          sender: {
            username: 'username_1',
          },
          sent_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(messageService, 'findAll').mockResolvedValue(messageFoundMock);

      const updatedMessage = await messageService.findAll(FindMessageDto);

      expect(messageService.findAll).toBeCalled();
      expect(messageService.findAll).toBeCalledWith(FindMessageDto);

      expect(updatedMessage).toEqual(messageFoundMock);
    });

    it('should find all group messages', async () => {
      const FindMessageDto = {
        group_id: 'group_id_1',
      };

      const messageFoundMock = [
        {
          id: 'message_id_1',
          message: 'new message',
          group_id: 'group_id_1',
          contact_id: '',
          sender_id: 'user_1',
          sender: {
            username: 'username_1',
          },
          sent_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(messageService, 'findAll').mockResolvedValue(messageFoundMock);

      const updatedMessage = await messageService.findAll(FindMessageDto);

      expect(messageService.findAll).toBeCalled();
      expect(messageService.findAll).toBeCalledWith(FindMessageDto);

      expect(updatedMessage).toEqual(messageFoundMock);
    });

    it('should return empty array if message not found', async () => {
      const FindMessageDto = {
        contact_id: 'not_exist_contact_id',
      };

      jest.spyOn(messageService, 'findAll').mockResolvedValue([]);

      const messageFound = await messageService.findAll(FindMessageDto);

      expect(messageFound).toEqual([]);
    });

    it('should remove message', async () => {
      jest.spyOn(messageService, 'remove').mockResolvedValue(undefined);

      await expect(
        messageService.remove(['message_id_1']),
      ).resolves.toBeUndefined();
    });

    it('should return exception if message that need to be remove not found', async () => {
      jest.spyOn(messageService, 'remove').mockResolvedValue(undefined);

      await expect(
        messageService.remove(['not_exist_message_id']),
      ).resolves.toBeUndefined();
    });
  });

  describe('Integration Testing', () => {
    let messageService: MessageService;
    let prismaService: PrismaService;

    const user_1 = 'user_1';
    const user_2 = 'user_2';
    const user_3 = 'user_3';

    let contact_id: string;
    let group_id: string;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [PrismaModule],
        providers: [MessageService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      messageService = module.get<MessageService>(MessageService);
    });

    beforeAll(async () => {
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

    it('should be defined', () => {
      expect(messageService).toBeDefined();
    });

    it('should create private message and return record', async () => {
      const createMessageDto = {
        sender_id: user_1,
        contact_id,
        message: 'message',
      };

      const createdMessage = await messageService.create(createMessageDto);

      expect(createdMessage.message).toBe(createMessageDto.message);
      expect(createdMessage.contact_id).toBe(createMessageDto.contact_id);
      expect(createdMessage.sender_id).toBe(createMessageDto.sender_id);
    });

    it('should create group message and return record', async () => {
      const createMessageDto = {
        sender_id: user_1,
        group_id,
        message: 'message',
      };

      const createdMessage = await messageService.create(createMessageDto);

      expect(createdMessage.message).toBe(createMessageDto.message);
      expect(createdMessage.group_id).toBe(createMessageDto.group_id);
      expect(createdMessage.sender_id).toBe(createMessageDto.sender_id);
    });

    it('should return exception if contact id not found when create message', async () => {
      const createMessageDto = {
        sender_id: user_1,
        contact_id: 'not_exist_contact_id',
        message: 'messsage',
      };

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should return exception if sender id not found when create message', async () => {
      const createMessageDto = {
        sender_id: 'not_exist_user_id',
        contact_id,
        message: 'messsage',
      };

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should return exception if group id not found when create message', async () => {
      const createMessageDto = {
        sender_id: user_1,
        group_id: 'not_exist_group_id',
        message: 'message',
      };

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should return exception if group id and contact id both were given when create message', async () => {
      const createMessageDto = {
        sender_id: user_1,
        group_id,
        contact_id,
        message: 'message',
      };

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should update message and return record', async () => {
      const message = await prismaService.message.findFirst({
        where: {
          sender_id: user_1,
          message: 'message',
        },
      });

      const updateMessageDto = {
        id: message.id,
        message: 'change message',
      };

      const updatedMessage = await messageService.update(updateMessageDto);

      expect(updatedMessage.message).toEqual(updateMessageDto.message);
    });

    it('should find all message', async () => {
      const FindMessageDto = {
        contact_id,
      };

      const [message] = await messageService.findAll(FindMessageDto);

      expect(message.message).toEqual('change message');
    });

    it('should return empty array if message not found', async () => {
      const FindMessageDto = {
        group_id: 'not_exist_group_id', // it can also mean there is also no message created if group exist.
      };

      const messageFound = await messageService.findAll(FindMessageDto);

      expect(messageFound).toEqual([]);
    });

    it('should remove message', async () => {
      const messageId = await prismaService.message.findFirst({
        where: {
          sender_id: user_1,
          message: 'change message',
        },
      });

      await expect(
        messageService.remove([messageId.id]),
      ).resolves.toBeUndefined();
    });

    it('should return exception if message that need to be remove not found', async () => {
      await expect(
        messageService.remove(['not_exist_message_id']),
      ).resolves.toBeUndefined();
    });

    afterAll(async () => {
      await prismaService.$transaction([
        prismaService.message.deleteMany({
          where: {
            sender_id: user_1,
          },
        }),
        prismaService.contact.deleteMany({
          where: {
            id: contact_id,
          },
        }),
        prismaService.group.deleteMany({
          where: {
            id: group_id,
          },
        }),
        prismaService.users.deleteMany({
          where: {
            user_id: {
              in: [user_1, user_2, user_3],
            },
          },
        }),
      ]);
    });
  });
});
