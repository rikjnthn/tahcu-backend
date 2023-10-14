import { Test, TestingModule } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { MessageService } from './message.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { NotFoundException } from '@nestjs/common';

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

    it('should create message and return record', async () => {
      const createMessageDto = {
        sender_id: 'budi',
        receiver_id: 'andi',
        message: 'pesan',
      };

      const createdMessageMock = {
        id: '1',
        message: 'pesan',
        group_id: '',
        sender_id: 'budi',
        receiver_id: 'andi',
        sent_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(messageService, 'create')
        .mockResolvedValue(createdMessageMock);

      const createdMessage = await messageService.create(createMessageDto);

      expect(messageService.create).toBeCalled();
      expect(messageService.create).toBeCalledWith(createMessageDto);

      expect(createdMessage).toEqual(createdMessageMock);
    });

    it('should return exception if sender id or receiver id not found when create message', async () => {
      const createMessageDto = {
        sender_id: 'not_found',
        receiver_id: 'not_found_too',
        message: 'pesan',
      };

      jest
        .spyOn(messageService, 'create')
        .mockRejectedValue(new WsException('user not found'));

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError(new WsException('user not found'));
    });

    it('should return exception if sender id and receiver id are the same when create message', async () => {
      const createMessageDto = {
        sender_id: 'budi',
        receiver_id: 'budi',
        message: 'pesan',
      };

      jest.spyOn(messageService, 'create').mockRejectedValue(
        new WsException({
          status: 'error',
          message: 'sender id and receiver id should not be equal',
        }),
      );

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError(
        new WsException({
          status: 'error',
          message: 'sender id and receiver id should not be equal',
        }),
      );
    });

    it('should update message and return record', async () => {
      const updateMessageDto = {
        sender_id: 'budi',
        receiver_id: 'andi',
        message: 'ganti pesan',
      };

      const updatedMessageMock = {
        id: '1',
        message: 'ganti pesan',
        group_id: '',
        sender_id: 'budi',
        receiver_id: 'andi',
        sent_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(messageService, 'update')
        .mockResolvedValue(updatedMessageMock);

      const updatedMessage = await messageService.update('1', updateMessageDto);

      expect(messageService.update).toBeCalled();
      expect(messageService.update).toBeCalledWith('1', updateMessageDto);

      expect(updatedMessage).toEqual(updatedMessageMock);
    });

    it('should return exception if sender id or receiver id not found when update message', async () => {
      const updateMessageDto = {
        sender_id: 'not_found',
        receiver_id: 'not_found_too',
        message: 'pesan',
      };

      jest
        .spyOn(messageService, 'update')
        .mockRejectedValue(new WsException('user not found'));

      await expect(
        messageService.update('1', updateMessageDto),
      ).rejects.toThrowError(new WsException('user not found'));
    });

    it('should return exception if sender id and receiver id are the same when update message', async () => {
      const updateMessageDto = {
        sender_id: 'budi',
        receiver_id: 'budi',
        message: 'pesan',
      };

      jest.spyOn(messageService, 'update').mockRejectedValue(
        new WsException({
          status: 'error',
          message: 'sender id and receiver id should not be equal',
        }),
      );

      await expect(
        messageService.update('1', updateMessageDto),
      ).rejects.toThrowError(
        new WsException({
          status: 'error',
          message: 'sender id and receiver id should not be equal',
        }),
      );
    });

    it('should find all message', async () => {
      const FindMessageDto = {
        sender_id: 'budi',
        receiver_id: 'andi',
        lower_limit: 1,
      };

      const messageFoundMock = [
        {
          id: '1',
          message: 'ganti pesan',
          group_id: '',
          sender_id: 'budi',
          receiver_id: 'andi',
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
        sender_id: 'not_found',
        receiver_id: 'not_found_too',
        lower_limit: 1,
      };

      jest.spyOn(messageService, 'findAll').mockResolvedValue([]);

      const messageFound = await messageService.findAll(FindMessageDto);

      expect(messageFound).toEqual([]);
    });

    it('should remove message', async () => {
      jest.spyOn(messageService, 'remove').mockResolvedValue(undefined);

      await expect(messageService.remove(['1'])).resolves.toBeUndefined();
    });

    it('should return exception if message that need to be remove not found', async () => {
      jest
        .spyOn(messageService, 'remove')
        .mockRejectedValue(new NotFoundException());

      await expect(messageService.remove(['not_exist'])).rejects.toThrowError(
        new NotFoundException(),
      );
    });
  });

  describe('Integration Testing', () => {
    let messageService: MessageService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [PrismaModule],
        providers: [MessageService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      messageService = module.get<MessageService>(MessageService);
    });

    beforeAll(async () => {
      await prismaService.$transaction([
        prismaService.users.createMany({
          data: [
            {
              email: 'anto@gmail.com',
              is_active: true,
              password: 'password',
              user_id: 'anto',
              username: 'anto',
            },
            {
              email: 'dina@gmail.com',
              is_active: true,
              password: 'password',
              user_id: 'dina',
              username: 'dina',
            },
          ],
        }),
      ]);
    });

    it('should be defined', () => {
      expect(messageService).toBeDefined();
    });

    it('should create message and return record', async () => {
      const [anto, dina] = await prismaService.users.findMany({
        where: {
          OR: [{ user_id: 'anto' }, { user_id: 'dina' }],
        },
        select: {
          id: true,
        },
      });

      const createMessageDto = {
        sender_id: anto.id,
        receiver_id: dina.id,
        message: 'pesan',
      };

      const createdMessage = await messageService.create(createMessageDto);

      expect(createdMessage.message).toBe(createMessageDto.message);
      expect(createdMessage.receiver_id).toBe(createMessageDto.receiver_id);
      expect(createdMessage.sender_id).toBe(createMessageDto.sender_id);
    });

    it('should return exception if sender id or receiver id not found when create message', async () => {
      const createMessageDto = {
        sender_id: 'not_found',
        receiver_id: 'not_found_too',
        message: 'pesan',
      };

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should return exception if sender id and receiver id are the same when create message', async () => {
      const [anto] = await prismaService.users.findMany({
        where: {
          OR: [{ user_id: 'anto' }, { user_id: 'dina' }],
        },
        select: {
          id: true,
        },
      });

      const createMessageDto = {
        sender_id: anto.id,
        receiver_id: anto.id,
        message: 'pesan',
      };

      await expect(
        messageService.create(createMessageDto),
      ).rejects.toThrowError();
    });

    it('should update message and return record', async () => {
      const [anto, dina] = await prismaService.users.findMany({
        where: {
          OR: [{ user_id: 'anto' }, { user_id: 'dina' }],
        },
        select: {
          id: true,
        },
      });

      const updateMessageDto = {
        sender_id: anto.id,
        receiver_id: dina.id,
        message: 'ganti pesan',
      };

      const messageId = await prismaService.message.findFirst({
        where: {
          sender_id: anto.id,
          receiver_id: dina.id,
        },
        select: {
          id: true,
        },
      });

      const updatedMessage = await messageService.update(
        messageId.id,
        updateMessageDto,
      );

      expect(updatedMessage.message).toEqual(updateMessageDto.message);
    });

    it('should return exception if sender id or receiver id not found when update message', async () => {
      const updateMessageDto = {
        sender_id: 'not_found',
        receiver_id: 'not_found_too',
        message: 'pesan',
      };

      await expect(
        messageService.update('1', updateMessageDto),
      ).rejects.toThrowError();
    });

    it('should return exception if sender id and receiver id are the same when update message', async () => {
      const [anto] = await prismaService.users.findMany({
        where: {
          OR: [{ user_id: 'anto' }, { user_id: 'dina' }],
        },
        select: {
          id: true,
        },
      });

      const updateMessageDto = {
        sender_id: anto.id,
        receiver_id: anto.id,
        message: 'pesan',
      };

      await expect(
        messageService.update('1', updateMessageDto),
      ).rejects.toThrowError();
    });

    it('should find all message', async () => {
      const [anto, dina] = await prismaService.users.findMany({
        where: {
          OR: [{ user_id: 'anto' }, { user_id: 'dina' }],
        },
        select: { id: true },
      });

      const FindMessageDto = {
        sender_id: anto.id,
        receiver_id: dina.id,
        lower_limit: 0,
      };

      const messageFoundMock = {
        id: '1',
        message: 'ganti pesan',
        group_id: '',
        sender_id: 'budi',
        receiver_id: 'andi',
        sent_at: new Date(),
        updated_at: new Date(),
      };

      const [message] = await messageService.findAll(FindMessageDto);

      expect(message.message).toEqual(messageFoundMock.message);
    });

    it('should return empty array if message not found', async () => {
      const FindMessageDto = {
        sender_id: 'not_found',
        receiver_id: 'not_found_too',
        lower_limit: 1,
      };

      const messageFound = await messageService.findAll(FindMessageDto);

      expect(messageFound).toEqual([]);
    });

    it('should remove message', async () => {
      const messageId = await prismaService.message.findFirst({
        select: { id: true },
        where: {
          message: 'ganti pesan',
        },
      });

      await expect(
        messageService.remove([messageId.id]),
      ).resolves.toBeUndefined();
    });

    it('should return exception if message that need to be remove not found', async () => {
      await expect(messageService.remove(['not_exist'])).rejects.toThrowError();
    });

    afterAll(async () => {
      await prismaService.$transaction([
        prismaService.message.deleteMany(),
        prismaService.users.deleteMany(),
      ]);
    });
  });
});
