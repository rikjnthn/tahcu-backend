import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { PrivateChatService } from './private-chat.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrivateChatController } from './private-chat.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ThrottlerModule } from '@nestjs/throttler';

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

    afterEach(() => {
      jest.clearAllMocks();
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
      const error = new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'user id and friends id should not be the same',
        },
      });

      jest.spyOn(privateChatController, 'create').mockRejectedValue(error);

      await expect(
        privateChatController.create('same_user_id', 'same_user_id'),
      ).rejects.toThrowError(error);
    });

    it('should return exception if friend id is not found when create contact', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Friends id was not found',
        },
      });

      jest.spyOn(privateChatController, 'create').mockRejectedValue(error);

      await expect(
        privateChatController.create('not_exist_user_id', 'user_id'),
      ).rejects.toThrow(error);
    });

    it('should return exception if contact already exist when create contact', async () => {
      const error = new BadRequestException({
        error: {
          code: 'DUPLICATE_VALUE',
          message: 'The contact already exists',
        },
      });

      jest.spyOn(privateChatController, 'create').mockRejectedValue(error);

      await expect(
        privateChatController.create('user_1', 'user_2'),
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
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Contact to delete was not found',
        },
      });

      jest.spyOn(privateChatController, 'remove').mockRejectedValue(error);

      await expect(
        privateChatController.remove('not_exist_contact_id'),
      ).rejects.toThrow(error);
    });
  });

  describe('Integration Testing', () => {
    let privateChatController: PrivateChatController;
    let prismaService: PrismaService;

    let user_id: string;
    let friends_id: string;

    let module: TestingModule;

    beforeAll(async () => {
      module = await Test.createTestingModule({
        imports: [
          PrismaModule,
          UsersModule,
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
        providers: [PrivateChatService],
        controllers: [PrivateChatController],
      }).compile();

      prismaService = module.get(PrismaService);
      privateChatController = module.get(PrivateChatController);
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
      expect(privateChatController).toBeDefined();
    });

    it('should create private chat contact and return record', async () => {
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
        privateChatController.create('not_exist_user_id', user_id),
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
      await privateChatController.create('user_1', 'user_2');

      await expect(
        privateChatController.create('user_1', 'user_2'),
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
      await privateChatController.create(friends_id, user_id);

      const [foundPrivateChat] = await privateChatController.findAll(user_id);

      expect(foundPrivateChat.friends_id).toEqual(friends_id);
      expect(foundPrivateChat.user_id).toEqual(user_id);
    });

    it('should return empty array if private chat not found', async () => {
      await expect(
        privateChatController.findAll('not_exist_user_id'),
      ).resolves.toEqual([]);
    });

    it('should remove private chat contact', async () => {
      await privateChatController.create(friends_id, user_id);

      const privateChat = await prismaService.contact.findFirst({
        select: { id: true },
        where: {
          OR: [{ user_id: user_id }, { user_id: friends_id }],
        },
      });

      await expect(
        privateChatController.remove(privateChat.id),
      ).resolves.toBeUndefined();

      await expect(
        prismaService.contact.findFirst({
          where: { id: privateChat.id },
        }),
      ).resolves.toBeNull();
    });

    it('should return exception if contact not found', async () => {
      await expect(
        privateChatController.remove('not_exist_contact_id'),
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
      await module.close();
    });
  });
});
