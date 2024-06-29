import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrivateChatService } from './private-chat.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';

describe('PrivateChatService', () => {
  describe('Unit Testing', () => {
    let prismaService: PrismaService;
    let privateChatService: PrivateChatService;

    beforeAll(async () => {
      prismaService = new PrismaService();
      privateChatService = new PrivateChatService(prismaService);
    });

    it('should be defined', () => {
      expect(privateChatService).toBeDefined();
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
        .spyOn(privateChatService, 'create')
        .mockResolvedValue(createdPrivateChatMock);

      const createdPrivateChat = await privateChatService.create(
        'user_1',
        'user_2',
      );

      expect(privateChatService.create).toBeCalled();
      expect(privateChatService.create).toBeCalledWith('user_1', 'user_2');

      expect(createdPrivateChat).toEqual(createdPrivateChatMock);
    });

    it('should return exception if friend id and user id are the same when create contact', async () => {
      jest
        .spyOn(privateChatService, 'create')
        .mockRejectedValue(
          new BadRequestException('user id and friends id should not be equal'),
        );

      await expect(
        privateChatService.create('same_user_id', 'same_user_id'),
      ).rejects.toThrowError(
        new BadRequestException('user id and friends id should not be equal'),
      );
    });

    it('should return exception if friend id or user id is not found when create contact', async () => {
      jest.spyOn(privateChatService, 'create').mockRejectedValue(new Error());

      await expect(
        privateChatService.create('not_exist_user_id', 'not_exist_user_id_too'),
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
        .spyOn(privateChatService, 'findAll')
        .mockResolvedValue(foundPrivateChatMock);

      const foundPrivateChat = await privateChatService.findAll('user_1');

      expect(privateChatService.findAll).toBeCalled();
      expect(privateChatService.findAll).toBeCalledWith('user_1');

      expect(foundPrivateChat).toEqual(foundPrivateChatMock);
    });

    it('should return empty array if private chat not found', async () => {
      jest.spyOn(privateChatService, 'findAll').mockResolvedValue([]);

      await expect(
        privateChatService.findAll('not_exist_user_id'),
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
        .spyOn(privateChatService, 'update')
        .mockResolvedValue(updatedPrivateChatMock);

      const updatedPrivateChat = await privateChatService.update(
        'contact_id_1',
        updatedPrivateChatDto,
      );

      expect(privateChatService.update).toBeCalled();
      expect(privateChatService.update).toBeCalledWith(
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

      jest.spyOn(privateChatService, 'update').mockRejectedValue(new Error());

      await expect(
        privateChatService.update('contact_id_1', createPrivateChatDto),
      ).rejects.toThrowError();
    });

    it('should remove private chat contact', async () => {
      jest.spyOn(privateChatService, 'remove').mockResolvedValue(undefined);

      const shouldBeUndefined = await privateChatService.remove('contact_id_1');

      expect(privateChatService.remove).toBeCalled();
      expect(privateChatService.remove).toBeCalledWith('contact_id_1');

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return exception if contact not found', async () => {
      jest.spyOn(privateChatService, 'remove').mockRejectedValue(new Error());

      await expect(
        privateChatService.remove('not_exist_contact_id'),
      ).rejects.toThrowError();
    });
  });

  describe('Integration Testing', () => {
    let privateChatService: PrivateChatService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [PrismaModule],
        providers: [PrivateChatService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      privateChatService = module.get<PrivateChatService>(PrivateChatService);
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
      expect(privateChatService).toBeDefined();
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

      const createdPrivateChat = await privateChatService.create(
        friends_id,
        user_id,
      );

      expect(createdPrivateChat.friends_id).toEqual(friends_id);
      expect(createdPrivateChat.user_id).toEqual(user_id);
    });

    it('should return exception if friend id and user id are the same when create contact', async () => {
      await expect(
        privateChatService.create('same_user_id', 'same_user_id'),
      ).rejects.toThrowError();
    });

    it('should return exception if friend id or user id is not found when create contact', async () => {
      await expect(
        privateChatService.create('not_exist_user_id', 'user_2'),
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

      const [foundPrivateChat] = await privateChatService.findAll(
        user_1.user_id,
      );

      expect(foundPrivateChat.friends_id).toEqual(user_2.user_id);
      expect(foundPrivateChat.user_id).toEqual(user_1.user_id);
    });

    it('should return empty array if private chat not found', async () => {
      await expect(
        privateChatService.findAll('not_exist_user_id'),
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

      const updatedPrivateChat = await privateChatService.update(
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
        privateChatService.update(privateChatId.id, createPrivateChatDto),
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
        privateChatService.remove(privateChatId.id),
      ).resolves.toBeUndefined();
    });

    it('should return exception if contact not found', async () => {
      await expect(
        privateChatService.remove('not_exist_contact_id'),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
