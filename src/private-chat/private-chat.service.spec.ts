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

    afterEach(() => {
      jest.clearAllMocks();
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
      const error = new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'user id and friends id should not be the same',
        },
      });

      jest.spyOn(privateChatService, 'create').mockRejectedValue(error);

      await expect(
        privateChatService.create('same_user_id', 'same_user_id'),
      ).rejects.toThrowError(error);
    });

    it('should return exception if friend id is not found when create contact', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Friends id was not found',
        },
      });

      jest.spyOn(privateChatService, 'create').mockRejectedValue(error);

      await expect(
        privateChatService.create('not_exist_user_id', 'user_id'),
      ).rejects.toThrow(error);
    });

    it('should return exception if contact already exist when create contact', async () => {
      const error = new BadRequestException({
        error: {
          code: 'DUPLICATE_VALUE',
          message: 'The contact already exists',
        },
      });

      jest.spyOn(privateChatService, 'create').mockRejectedValue(error);

      await expect(
        privateChatService.create('user_1', 'user_2'),
      ).rejects.toThrow(error);
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

    it('should remove private chat contact', async () => {
      jest.spyOn(privateChatService, 'remove').mockResolvedValue(undefined);

      const shouldBeUndefined = await privateChatService.remove('contact_id_1');

      expect(privateChatService.remove).toBeCalled();
      expect(privateChatService.remove).toBeCalledWith('contact_id_1');

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return exception if contact not found', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Contact to delete was not found',
        },
      });

      jest.spyOn(privateChatService, 'remove').mockRejectedValue(error);

      await expect(
        privateChatService.remove('not_exist_contact_id'),
      ).rejects.toThrow(error);
    });
  });

  describe('Integration Testing', () => {
    let privateChatService: PrivateChatService;
    let prismaService: PrismaService;

    let user_id: string;
    let friends_id: string;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [PrismaModule],
        providers: [PrivateChatService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      privateChatService = module.get<PrivateChatService>(PrivateChatService);
    });

    beforeEach(async () => {
      user_id = (
        await prismaService.users.create({
          data: {
            email: 'user_1@gmail.com',
            password: 'password',
            user_id: 'user_1',
            username: 'username_1',
          },
        })
      ).user_id;

      friends_id = (
        await prismaService.users.create({
          data: {
            email: 'user_2@gmail.com',
            password: 'password',
            user_id: 'user_2',
            username: 'username_2',
          },
        })
      ).user_id;
    });

    afterEach(async () => {
      await prismaService.$transaction([
        prismaService.users.deleteMany(),
        prismaService.contact.deleteMany(),
      ]);
    });

    it('should be defined', () => {
      expect(privateChatService).toBeDefined();
    });

    it('should create private chat contact and return record', async () => {
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
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'user id and friends id should not be the same',
          },
        }),
      );
    });

    it('should return exception if friend id or user id is not found when create contact', async () => {
      await expect(
        privateChatService.create('not_exist_user_id', user_id),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'Friends id was not found',
          },
        }),
      );
    });

    it('should return exception if contact already exist when create contact', async () => {
      await privateChatService.create('user_1', 'user_2');

      await expect(
        privateChatService.create('user_1', 'user_2'),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'DUPLICATE_VALUE',
            message: 'The contact already exists',
          },
        }),
      );
    });

    it('should find private chat contact', async () => {
      await privateChatService.create(friends_id, user_id);

      const [foundPrivateChat] = await privateChatService.findAll(user_id);

      expect(foundPrivateChat.friends_id).toEqual(friends_id);
      expect(foundPrivateChat.user_id).toEqual(user_id);
    });

    it('should return empty array if private chat not found', async () => {
      await expect(
        privateChatService.findAll('not_exist_user_id'),
      ).resolves.toEqual([]);
    });

    it('should remove private chat contact', async () => {
      await privateChatService.create(friends_id, user_id);

      const privateChat = await prismaService.contact.findFirst({
        select: { id: true },
        where: {
          OR: [{ user_id: user_id }, { user_id: friends_id }],
        },
      });

      await expect(
        privateChatService.remove(privateChat.id),
      ).resolves.toBeUndefined();

      await expect(
        prismaService.contact.findFirst({
          where: { id: privateChat.id },
        }),
      ).resolves.toBeNull();
    });

    it('should return exception if contact not found', async () => {
      await expect(
        privateChatService.remove('not_exist_contact_id'),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'Contact to delete was not found',
          },
        }),
      );
    });

    afterAll(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
