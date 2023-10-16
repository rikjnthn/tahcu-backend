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
      expect(groupMessageService.create).toBeCalledWith(createMessageDto, '1');

      expect(createdMessage).toEqual(createdMessageMock);
    });

    it('should return exception if group id not found when create message', async () => {
      const createMessageDto = {
        group_id: 'not_found',
        message: 'pesan',
      };

      jest
        .spyOn(groupMessageService, 'create')
        .mockRejectedValue(new WsException('group not found'));

      await expect(
        groupMessageGateway.create(createMessageDto, '1'),
      ).rejects.toThrowError(new WsException('group not found'));
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

      const updatedMessage = await groupMessageGateway.update(
        updateMessageDto,
        '1',
      );

      expect(groupMessageService.update).toBeCalled();
      expect(groupMessageService.update).toBeCalledWith(updateMessageDto, '1');

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
        .mockRejectedValue(new WsException('group not found'));

      await expect(
        groupMessageGateway.update(updateMessageDto, '1'),
      ).rejects.toThrowError(new WsException('group not found'));
    });

    it('should return exception if message id not found when update message', async () => {
      const updateMessageDto = {
        group_id: '1',
        message_id: 'not_found',
        message: 'pesan',
      };

      jest
        .spyOn(groupMessageService, 'update')
        .mockRejectedValue(new WsException('message not found'));

      await expect(
        groupMessageGateway.update(updateMessageDto, '1'),
      ).rejects.toThrowError(new WsException('message not found'));
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

      const foundMessage = await groupMessageGateway.findAll(FindMessageDto);

      expect(groupMessageService.findAll).toBeCalled();
      expect(groupMessageService.findAll).toBeCalledWith(FindMessageDto);

      expect(foundMessage).toEqual(messageFoundMock);
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
        groupMessageGateway.delete(['1'], '1', '1'),
      ).resolves.toBeUndefined();
    });

    it('should return exception if message that need to be remove not found', async () => {
      jest
        .spyOn(groupMessageService, 'delete')
        .mockRejectedValue(new NotFoundException());

      await expect(
        groupMessageGateway.delete(['not_exist'], '1', '1'),
      ).rejects.toThrowError(new NotFoundException());
    });

    it('should return exception if group id is not found', async () => {
      jest
        .spyOn(groupMessageService, 'delete')
        .mockRejectedValue(new NotFoundException());

      await expect(
        groupMessageGateway.delete(['1'], 'not_exist', '1'),
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
      await prismaService.$transaction(async (tx) => {
        const anto = await tx.users.create({
          data: {
            email: 'anto@gmail.com',
            is_active: true,
            password: 'password',
            user_id: 'anto',
            username: 'anto',
          },
        });

        const dina = await tx.users.create({
          data: {
            email: 'dina@gmail.com',
            is_active: true,
            password: 'password',
            user_id: 'dina',
            username: 'dina',
          },
        });

        await tx.group.create({
          data: {
            name: 'group uhui',
            created_by_id: anto.id,
            description: 'group baru euy',
            group_membership: {
              createMany: {
                data: [{ user_id: anto.id }, { user_id: dina.id }],
              },
            },
          },
        });
      });
    });

    it('should be defined', () => {
      expect(groupMessageGateway).toBeDefined();
    });

    it('should create message and return record', async () => {
      const group = await prismaService.group.findFirst({
        select: { id: true },
        where: { name: 'group uhui' },
      });

      const anto = await prismaService.users.findFirst({
        select: { id: true },
        where: { username: 'anto' },
      });

      const createMessageDto = {
        group_id: group.id,
        message: 'pesan',
      };

      const createdMessage = await groupMessageGateway.create(
        createMessageDto,
        anto.id,
      );

      expect(createdMessage.message).toBe(createMessageDto.message);
      expect(createdMessage.group_id).toBe(createMessageDto.group_id);
      expect(createdMessage.sender_id).toBe(anto.id);
    });

    it('should return exception if sender id is not found when create message', async () => {
      const group = await prismaService.group.findFirst({
        select: { id: true },
        where: { name: 'group uhui' },
      });

      const createMessageDto = {
        group_id: group.id,
        message: 'pesan',
      };

      await expect(
        groupMessageGateway.create(createMessageDto, 'not_found'),
      ).rejects.toThrowError();
    });

    it('should return exception if group id is not found when create message', async () => {
      const [anto] = await prismaService.users.findMany({
        where: {
          OR: [{ user_id: 'anto' }],
        },
        select: { id: true },
      });

      const createMessageDto = {
        group_id: 'not_found',
        message: 'pesan',
      };

      await expect(
        groupMessageGateway.create(createMessageDto, anto.id),
      ).rejects.toThrowError();
    });

    it('should update message and return record', async () => {
      const group = await prismaService.group.findFirst({
        select: { id: true },
        where: { name: 'group uhui' },
      });

      const message = await prismaService.message.findFirst({
        select: { id: true },
        where: { message: 'pesan' },
      });

      const anto = await prismaService.users.findFirst({
        select: { id: true },
        where: { username: 'anto' },
      });

      const updateMessageDto = {
        group_id: group.id,
        message_id: message.id,
        message: 'pesan baru',
      };

      const updatedMessage = await groupMessageGateway.update(
        updateMessageDto,
        anto.id,
      );

      expect(updatedMessage.message).toEqual(updateMessageDto.message);
      expect(updatedMessage.sender_id).toEqual(anto.id);
      expect(updatedMessage.group_id).toEqual(updateMessageDto.group_id);
    });

    it('should return exception if sender id is not found when update message', async () => {
      const group = await prismaService.group.findFirst({
        select: { id: true },
        where: { name: 'group uhui' },
      });

      const message = await prismaService.message.findFirst({
        select: { id: true },
        where: { message: 'pesan baru' },
      });

      const updateMessageDto = {
        group_id: group.id,
        message_id: message.id,
        message: 'pesan',
      };

      await expect(
        groupMessageGateway.update(updateMessageDto, 'not_exist'),
      ).rejects.toThrowError();
    });

    it('should return exception if group id is not found when update message', async () => {
      const message = await prismaService.message.findFirst({
        select: { id: true },
        where: { message: 'pesan baru' },
      });

      const anto = await prismaService.users.findFirst({
        select: { id: true },
        where: { username: 'anto' },
      });

      const updateMessageDto = {
        group_id: 'not_exist',
        message_id: message.id,
        message: 'pesan',
      };

      await expect(
        groupMessageGateway.update(updateMessageDto, anto.id),
      ).rejects.toThrowError();
    });

    it('should return exception if message id is not found when update message', async () => {
      const group = await prismaService.group.findFirst({
        select: { id: true },
        where: { name: 'group uhui' },
      });

      const anto = await prismaService.users.findFirst({
        select: { id: true },
        where: { username: 'anto' },
      });

      const updateMessageDto = {
        group_id: group.id,
        message_id: 'not_exist',
        message: 'pesan',
      };

      await expect(
        groupMessageGateway.update(updateMessageDto, anto.id),
      ).rejects.toThrowError();
    });

    it('should find all message', async () => {
      const group = await prismaService.group.findFirst({
        select: { id: true },
        where: { name: 'group uhui' },
      });

      const anto = await prismaService.users.findFirst({
        select: { id: true },
        where: { username: 'anto' },
      });

      const findMessageDto = {
        group_id: group.id,
        skip: 0,
      };

      const messageFoundMock = {
        message: 'pesan baru',
        group_id: '',
        sender_id: anto.id,
      };

      const [foundMessage] = await groupMessageGateway.findAll(findMessageDto);

      expect(foundMessage.group_id).toEqual(findMessageDto.group_id);
      expect(foundMessage.message).toEqual(messageFoundMock.message);
      expect(foundMessage.sender_id).toEqual(messageFoundMock.sender_id);
    });

    it('should return empty array if message not found', async () => {
      const findMessageDto = {
        group_id: 'not_exist',
        skip: 0,
      };

      const messageFound = await groupMessageGateway.findAll(findMessageDto);

      expect(messageFound).toEqual([]);
    });

    it('should remove message', async () => {
      const message = await prismaService.message.findFirst({
        select: { id: true },
        where: { message: 'pesan baru' },
      });
      const group = await prismaService.group.findFirst({
        select: { id: true },
        where: { name: 'group uhui' },
      });

      const anto = await prismaService.users.findFirst({
        select: { id: true },
        where: { username: 'anto' },
      });

      await expect(
        groupMessageGateway.delete([message.id], group.id, anto.id),
      ).resolves.toBeUndefined();
    });

    afterAll(async () => {
      await prismaService.$transaction([
        prismaService.message.deleteMany(),
        prismaService.group.deleteMany(),
        prismaService.users.deleteMany(),
      ]);
    });
  });
});
