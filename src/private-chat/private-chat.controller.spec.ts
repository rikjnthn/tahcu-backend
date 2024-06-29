import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrivateChatService } from './private-chat.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrivateChatController } from './private-chat.controller';

describe('PrivateChatController', () => {
  describe('Unit Testing', () => {
    let prismaService: PrismaService;
    let privateChatService: PrivateChatService;
    let privateChatController: PrivateChatController;

    beforeAll(async () => {
      prismaService = new PrismaService();
      privateChatService = new PrivateChatService(prismaService);
      privateChatController = new PrivateChatController(privateChatService);
    });

    it('should be defined', () => {
      expect(privateChatController).toBeDefined();
    });

    it('should create private chat contact and return record', async () => {
      const createdPrivateChatMock = {
        id: 'contact_id_1',
        user_id: 'user_1',
        user: {
          username: 'username_1',
          email: 'user_1@gmail.com',
        },
        friends_id: 'user_2',
        friends: {
          username: 'username_2',
          email: 'user_2@gmail.com',
        },
      };

      jest
        .spyOn(privateChatController, 'create')
        .mockResolvedValue(createdPrivateChatMock);

      const createdPrivateChat = await privateChatController.create(
        'user_1',
        'user_2',
      );

      expect(privateChatController.create).toBeCalled();
      expect(privateChatController.create).toBeCalledWith('user_1', 'user_2');

      expect(createdPrivateChat).toEqual(createdPrivateChatMock);
    });

    it('should return exception if friend id and user id are the same when create contact', async () => {
      jest
        .spyOn(privateChatController, 'create')
        .mockRejectedValue(
          new BadRequestException('user id and friends id should not be equal'),
        );

      await expect(
        privateChatController.create('same_user_id', 'same_user_id'),
      ).rejects.toThrowError(
        new BadRequestException('user id and friends id should not be equal'),
      );
    });

    it('should return exception if friend id or user id is not found when create contact', async () => {
      jest
        .spyOn(privateChatController, 'create')
        .mockRejectedValue(new Error());

      await expect(
        privateChatController.create(
          'not_exist_user_id',
          'not_exist_user_id_too',
        ),
      ).rejects.toThrowError();
    });

    it('should find private chat contact', async () => {
      const foundPrivateChatMock = [
        {
          id: 'contact_id_1',
          user_id: 'user_1',
          user: {
            username: 'username_1',
            email: 'user_1@gmail.com',
          },
          friends_id: 'user_2',
          friends: {
            username: 'username_2',
            email: 'user_2@gmail.com',
          },
        },
      ];

      jest
        .spyOn(privateChatController, 'findAll')
        .mockResolvedValue(foundPrivateChatMock);

      const foundPrivateChat = await privateChatController.findAll('user_1');

      expect(privateChatController.findAll).toBeCalled();
      expect(privateChatController.findAll).toBeCalledWith('user_1');

      expect(foundPrivateChat).toEqual(foundPrivateChatMock);
    });

    it('should return empty array if private chat not found', async () => {
      jest.spyOn(privateChatController, 'findAll').mockResolvedValue([]);

      await expect(
        privateChatController.findAll('not_exist_user_id'),
      ).resolves.toEqual([]);
    });

    it('should update private chat contact and return record', async () => {
      const updatedPrivateChatDto = {
        user_id: 'user_1',
        friends_id: 'new_user_2',
      };

      const updatedPrivateChatMock = {
        id: 'contact_id_1',
        user_id: 'user_1',
        user: {
          username: 'username_1',
          email: 'user_1@gmail.com',
        },
        friends_id: 'new_user_2',
        friends: {
          username: 'username_1',
          email: 'user_2@gmail.com',
        },
      };

      jest
        .spyOn(privateChatController, 'update')
        .mockResolvedValue(updatedPrivateChatMock);

      const updatedPrivateChat = await privateChatController.update(
        'contact_id_1',
        updatedPrivateChatDto,
      );

      expect(privateChatController.update).toBeCalled();
      expect(privateChatController.update).toBeCalledWith(
        'contact_id_1',
        updatedPrivateChatDto,
      );

      expect(updatedPrivateChat).toEqual(updatedPrivateChatMock);
    });

    it('should return exception if friend id or user id is not found when update contact', async () => {
      const createPrivateChatDto = {
        user_id: 'not_exist_user_id',
        friends_id: 'user_2',
      };

      jest
        .spyOn(privateChatController, 'update')
        .mockRejectedValue(new Error());

      await expect(
        privateChatController.update('contact_id_1', createPrivateChatDto),
      ).rejects.toThrowError();
    });

    it('should remove private chat contact', async () => {
      jest.spyOn(privateChatController, 'remove').mockResolvedValue(undefined);

      const shouldBeUndefined = await privateChatController.remove(
        'contact_id_1',
      );

      expect(privateChatController.remove).toBeCalled();
      expect(privateChatController.remove).toBeCalledWith('contact_id_1');

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return exception if contact not found', async () => {
      jest
        .spyOn(privateChatController, 'remove')
        .mockRejectedValue(new Error());

      await expect(
        privateChatController.remove('not_exist_contact_id'),
      ).rejects.toThrowError();
    });
  });

  describe('Integration Testing', () => {
    let prismaService: PrismaService;
    let privateChatController: PrivateChatController;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          PrismaModule,
          JwtModule,
          ThrottlerModule.forRoot([
            {
              ttl: parseInt(process.env.DEFAULT_THROTTLER_TTL),
              limit: parseInt(process.env.DEFAULT_THROTTLER_LIMIT),
            },
          ]),
        ],
        providers: [PrivateChatService],
        controllers: [PrivateChatController],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      privateChatController = module.get<PrivateChatController>(
        PrivateChatController,
      );
    });

    beforeAll(async () => {
      await prismaService.$transaction([
        prismaService.users.createMany({
          data: [
            {
              email: 'user_1@gmail.com',
              password: 'password',
              user_id: 'user_1',
              username: 'username_1',
            },
            {
              email: 'user_2@gmail.com',
              password: 'password',
              user_id: 'user_2',
              username: 'username_2',
            },
          ],
        }),
      ]);
    });

    it('should be defined', () => {
      expect(privateChatController).toBeDefined();
    });

    it('should create private chat contact and return record', async () => {
      const user_1 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_1',
        },
      });

      const user_2 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_2',
        },
      });

      const user_id = user_1.user_id;
      const friends_id = user_2.user_id;

      const createdPrivateChat = await privateChatController.create(
        friends_id,
        user_id,
      );

      expect(createdPrivateChat.friends_id).toEqual(friends_id);
      expect(createdPrivateChat.user_id).toEqual(user_id);
    });

    it('should return exception if friend id and user id are the same when create contact', async () => {
      await expect(
        privateChatController.create('same_user_id', 'same_user_id'),
      ).rejects.toThrowError();
    });

    it('should return exception if friend id or user id is not found when create contact', async () => {
      await expect(
        privateChatController.create('not_exist_user_id', 'user_2'),
      ).rejects.toThrowError();
    });

    it('should find private chat contact', async () => {
      const user_1 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_1',
        },
      });

      const user_2 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_2',
        },
      });

      const [foundPrivateChat] = await privateChatController.findAll(
        user_1.user_id,
      );

      expect(foundPrivateChat.friends_id).toEqual(user_2.user_id);
      expect(foundPrivateChat.user_id).toEqual(user_1.user_id);
    });

    it('should return empty array if private chat not found', async () => {
      await expect(
        privateChatController.findAll('not_exist_user_id'),
      ).resolves.toEqual([]);
    });

    it('should update private chat contact and return record', async () => {
      const user_1 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_1',
        },
      });

      const user_2 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_2',
        },
      });

      const updatedPrivateChatDto = {
        user_id: user_1.user_id,
        friends_id: user_2.user_id,
      };

      const privateChatId = await prismaService.contact.findFirst({
        select: { id: true },
        where: {
          OR: [{ user_id: user_1.user_id }, { friends_id: user_1.user_id }],
        },
      });

      const updatedPrivateChat = await privateChatController.update(
        privateChatId.id,
        updatedPrivateChatDto,
      );

      expect(updatedPrivateChat.friends_id).toEqual(
        updatedPrivateChatDto.friends_id,
      );
      expect(updatedPrivateChat.user_id).toEqual(updatedPrivateChatDto.user_id);
    });

    it('should return exception if friend id or user id is not found when update contact', async () => {
      const user_1 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_1',
        },
      });

      const user_2 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_2',
        },
      });

      const privateChatId = await prismaService.contact.findFirst({
        select: { id: true },
        where: {
          OR: [{ user_id: user_1.user_id }, { user_id: user_2.user_id }],
        },
      });
      const createPrivateChatDto = {
        user_id: 'not_exist_user_id',
        friends_id: 'user_2',
      };

      await expect(
        privateChatController.update(privateChatId.id, createPrivateChatDto),
      ).rejects.toThrowError();
    });

    it('should remove private chat contact', async () => {
      const user_1 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_1',
        },
      });

      const user_2 = await prismaService.users.findFirst({
        select: { user_id: true },
        where: {
          user_id: 'user_2',
        },
      });

      const privateChatId = await prismaService.contact.findFirst({
        select: { id: true },
        where: {
          OR: [{ user_id: user_1.user_id }, { user_id: user_2.user_id }],
        },
      });

      await expect(
        privateChatController.remove(privateChatId.id),
      ).resolves.toBeUndefined();
    });

    it('should return exception if contact not found', async () => {
      await expect(
        privateChatController.remove('not_exist_contact_id'),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
