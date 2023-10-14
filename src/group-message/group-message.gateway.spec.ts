import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { GroupMessageGateway } from './group-message.gateway';
import { GroupMessageService } from './group-message.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

describe('GroupMessageGateway', () => {
  describe('Unit Testing', () => {
    let groupMessageGateway: GroupMessageGateway;
    let groupMessageService: GroupMessageService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      prismaService = new PrismaService();
      groupMessageService = new GroupMessageService(prismaService);
      groupMessageGateway = new GroupMessageGateway(groupMessageService);
    });

    it('should be defined', () => {
      expect(GroupMessageGateway).toBeDefined();
    });

    it('should create message and return record', async () => {
      const createMessageDto = {
        message: 'pesan',
        group_id: '1',
      };

      const createdMessageMock = {
        id: '1',
        message: 'pesan',
        group_id: '1',
        sender_id: 'budi',
        receiver_id: '',
        sent_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(groupMessageService, 'create')
        .mockResolvedValue(createdMessageMock);

      const createdMessage = await groupMessageGateway.create(
        createMessageDto,
        '1',
      );

      expect(groupMessageService.create).toBeCalled();
      expect(groupMessageService.create).toBeCalledWith(createMessageDto);

      expect(createdMessage).toEqual(createdMessageMock);
    });

    it('should return exception if group id not found when create message', async () => {
      const createMessageDto = {
        group_id: 'not_found',
        message: 'pesan',
      };

      jest
        .spyOn(groupMessageService, 'create')
        .mockRejectedValue(new WsException('user not found'));

      await expect(
        groupMessageGateway.create(createMessageDto, '1'),
      ).rejects.toThrowError(new WsException('user not found'));
    });

    it('should update message and return record', async () => {
      const updateMessageDto = {
        group_id: '1',
        message_id: '1',
        message: 'ganti pesan',
      };

      const updatedMessageMock = {
        id: '1',
        message: 'ganti pesan',
        group_id: '1',
        sender_id: 'budi',
        receiver_id: '',
        sent_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(groupMessageService, 'update')
        .mockResolvedValue(updatedMessageMock);

      const updatedMessage = await groupMessageGateway.update(updateMessageDto);

      expect(groupMessageService.update).toBeCalled();
      expect(groupMessageService.update).toBeCalledWith(updateMessageDto);

      expect(updatedMessage).toEqual(updatedMessageMock);
    });

    it('should return exception if group id not found when update message', async () => {
      const updateMessageDto = {
        group_id: 'not_found',
        message_id: '1',
        message: 'pesan',
      };

      jest
        .spyOn(groupMessageService, 'update')
        .mockRejectedValue(new WsException('user not found'));

      await expect(
        groupMessageGateway.update(updateMessageDto),
      ).rejects.toThrowError(new WsException('user not found'));
    });

    it('should find all message', async () => {
      const FindMessageDto = {
        group_id: '1',
        skip: 1,
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

      jest
        .spyOn(groupMessageService, 'findAll')
        .mockResolvedValue(messageFoundMock);

      const updatedMessage = await groupMessageGateway.findAll(FindMessageDto);

      expect(groupMessageService.findAll).toBeCalled();
      expect(groupMessageService.findAll).toBeCalledWith(FindMessageDto);

      expect(updatedMessage).toEqual(messageFoundMock);
    });

    it('should return empty array if message not found', async () => {
      const FindMessageDto = {
        group_id: 'not_found',
        skip: 1,
      };

      jest.spyOn(groupMessageService, 'findAll').mockResolvedValue([]);

      const messageFound = await groupMessageGateway.findAll(FindMessageDto);

      expect(messageFound).toEqual([]);
    });

    it('should remove message', async () => {
      jest.spyOn(groupMessageService, 'delete').mockResolvedValue(undefined);

      await expect(
        groupMessageGateway.delete(['1'], '1'),
      ).resolves.toBeUndefined();
    });

    it('should return exception if message that need to be remove not found', async () => {
      jest
        .spyOn(groupMessageService, 'delete')
        .mockRejectedValue(new NotFoundException());

      await expect(
        groupMessageGateway.delete(['not_exist'], '1'),
      ).rejects.toThrowError(new NotFoundException());
    });
  });

  describe('Integration Testing', () => {
    let groupMessageGateway: GroupMessageGateway;
    let prismaService: PrismaService;

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
          UsersModule,
        ],
        providers: [GroupMessageGateway, GroupMessageService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      groupMessageGateway =
        module.get<GroupMessageGateway>(GroupMessageGateway);
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
      expect(groupMessageGateway).toBeDefined();
    });

    it('should create message and return record', async () => {
      const createMessageDto = {
        group_id: '',
        message: 'pesan',
      };

      const createdMessage = await groupMessageGateway.create(createMessageDto);

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
        groupMessageGateway.create(createMessageDto),
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
        groupMessageGateway.create(createMessageDto),
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

      const updatedMessage = await groupMessageGateway.update(
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
        groupMessageGateway.update('1', updateMessageDto),
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
        groupMessageGateway.update('1', updateMessageDto),
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

      const [message] = await groupMessageGateway.findAll(FindMessageDto);

      expect(message.message).toEqual(messageFoundMock.message);
    });

    it('should return empty array if message not found', async () => {
      const FindMessageDto = {
        sender_id: 'not_found',
        receiver_id: 'not_found_too',
        lower_limit: 1,
      };

      const messageFound = await groupMessageGateway.findAll(FindMessageDto);

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
        groupMessageGateway.delete([messageId.id]),
      ).resolves.toBeUndefined();
    });

    it('should return exception if message that need to be remove not found', async () => {
      await expect(
        groupMessageGateway.delete(['not_exist'], '1'),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await prismaService.$transaction([
        prismaService.message.deleteMany(),
        prismaService.users.deleteMany(),
      ]);
    });
  });
});
