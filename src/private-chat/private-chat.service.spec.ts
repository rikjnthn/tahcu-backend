import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
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
      const createPrivateChatDto = {
        user_id: 'andi',
        friends_id: 'dina',
      };

      const createdPrivateChatMock = {
        id: '1',
        user_id: 'andi',
        friends_id: 'dina',
      };

      jest
        .spyOn(privateChatService, 'create')
        .mockResolvedValue(createdPrivateChatMock);

      const createdPrivateChat = await privateChatService.create(
        createPrivateChatDto,
      );

      expect(privateChatService.create).toBeCalled();
      expect(privateChatService.create).toBeCalledWith(createPrivateChatDto);

      expect(createdPrivateChat).toEqual(createdPrivateChatMock);
    });

    it('should return exception if friend id and user id are the same when create contact', async () => {
      const createPrivateChatDto = {
        user_id: 'andi',
        friends_id: 'dina',
      };

      jest.spyOn(privateChatService, 'create').mockRejectedValue(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'user id and friends id should not be equal',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      await expect(
        privateChatService.create(createPrivateChatDto),
      ).rejects.toThrowError(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'user id and friends id should not be equal',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return exception if friend id or user id is not found when create contact', async () => {
      const createPrivateChatDto = {
        user_id: 'andi_bukan_user',
        friends_id: 'dina',
      };

      jest.spyOn(privateChatService, 'create').mockRejectedValue(new Error());

      await expect(
        privateChatService.create(createPrivateChatDto),
      ).rejects.toThrowError();
    });

    it('should find private chat contact', async () => {
      const requestMock = {
        user: {
          id: '1',
        } as any,
      } as Request;

      const foundPrivateChatMock = [
        {
          id: '1',
          user_id: 'andi',
          friends_id: 'dina',
        },
      ];

      jest
        .spyOn(privateChatService, 'findAll')
        .mockResolvedValue(foundPrivateChatMock);

      const foundPrivateChat = await privateChatService.findAll(requestMock);

      expect(privateChatService.findAll).toBeCalled();
      expect(privateChatService.findAll).toBeCalledWith(requestMock);

      expect(foundPrivateChat).toEqual(foundPrivateChatMock);
    });

    it('should return empty array if private chat not found', async () => {
      const requestMock = {
        user: {
          id: '1',
        } as any,
      } as Request;

      jest.spyOn(privateChatService, 'findAll').mockResolvedValue([]);

      await expect(privateChatService.findAll(requestMock)).resolves.toEqual(
        [],
      );
    });

    it('should update private chat contact and return record', async () => {
      const updatedPrivateChatDto = {
        user_id: 'andi',
        friends_id: 'dina_baru',
      };

      const updatedPrivateChatMock = {
        id: '1',
        user_id: 'andi',
        friends_id: 'dina_baru',
      };

      jest
        .spyOn(privateChatService, 'update')
        .mockResolvedValue(updatedPrivateChatMock);

      const updatedPrivateChat = await privateChatService.update(
        '1',
        updatedPrivateChatDto,
      );

      expect(privateChatService.update).toBeCalled();
      expect(privateChatService.update).toBeCalledWith(
        '1',
        updatedPrivateChatDto,
      );

      expect(updatedPrivateChat).toEqual(updatedPrivateChatMock);
    });

    it('should return exception if friend id or user id is not found when update contact', async () => {
      const createPrivateChatDto = {
        user_id: 'andi_bukan_user',
        friends_id: 'dina',
      };

      jest.spyOn(privateChatService, 'update').mockRejectedValue(new Error());

      await expect(
        privateChatService.update('1', createPrivateChatDto),
      ).rejects.toThrowError();
    });

    it('should remove private chat contact', async () => {
      jest.spyOn(privateChatService, 'remove').mockResolvedValue(undefined);

      const foundPrivateChat = await privateChatService.remove(['1']);

      expect(privateChatService.remove).toBeCalled();
      expect(privateChatService.remove).toBeCalledWith(['1']);

      expect(foundPrivateChat).toBeUndefined();
    });

    it('should return exception if contact not found', async () => {
      jest
        .spyOn(privateChatService, 'remove')
        .mockRejectedValue(new NotFoundException());

      await expect(
        privateChatService.remove(['not_exist_id']),
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
              email: 'andi@gmail.com',
              is_active: true,
              password: 'password',
              user_id: 'andi',
              username: 'andi',
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
      expect(privateChatService).toBeDefined();
    });

    it('should create private chat contact and return record', async () => {
      const [andi, dina] = await prismaService.users.findMany({
        select: { id: true },

        where: {
          OR: [{ username: 'andi' }, { username: 'dina' }],
        },
      });
      const createPrivateChatDto = {
        user_id: andi.id,
        friends_id: dina.id,
      };

      const createdPrivateChat = await privateChatService.create(
        createPrivateChatDto,
      );

      expect(createdPrivateChat.friends_id).toEqual(
        createPrivateChatDto.friends_id,
      );
      expect(createdPrivateChat.user_id).toEqual(createPrivateChatDto.user_id);
    });

    it('should return exception if friend id and user id are the same when create contact', async () => {
      const createPrivateChatDto = {
        user_id: 'andi',
        friends_id: 'andi',
      };

      await expect(
        privateChatService.create(createPrivateChatDto),
      ).rejects.toThrowError(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'user id and friends id should not be equal',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return exception if friend id or user id is not found when create contact', async () => {
      const createPrivateChatDto = {
        user_id: 'andi_bukan_user',
        friends_id: 'dina',
      };

      await expect(
        privateChatService.create(createPrivateChatDto),
      ).rejects.toThrowError();
    });

    it('should find private chat contact', async () => {
      const [andi, dina] = await prismaService.users.findMany({
        select: { id: true },
        where: {
          OR: [{ username: 'andi' }, { username: 'dina' }],
        },
      });

      const requestMock = {
        user: {
          id: andi.id,
        } as any,
      } as Request;

      const [foundPrivateChat] = await privateChatService.findAll(requestMock);

      expect(foundPrivateChat.friends_id).toEqual(dina.id);
      expect(foundPrivateChat.user_id).toEqual(andi.id);
    });

    it('should return empty array if private chat not found', async () => {
      const requestMock = {
        user: { id: '1' } as any,
      } as Request;

      await expect(privateChatService.findAll(requestMock)).resolves.toEqual(
        [],
      );
    });

    it('should update private chat contact and return record', async () => {
      const [andi, dina] = await prismaService.users.findMany({
        select: { id: true },
        where: {
          OR: [{ username: 'andi' }, { username: 'dina' }],
        },
      });
      const updatedPrivateChatDto = {
        user_id: andi.id,
        friends_id: dina.id,
      };

      const privateChatId = await prismaService.contact.findFirst({
        select: { id: true },
        where: {
          OR: [{ user_id: andi.id }, { user_id: dina.id }],
        },
      });

      const updatedPrivateChat = await privateChatService.update(
        privateChatId.id,
        updatedPrivateChatDto,
      );

      expect(updatedPrivateChat.friends_id).toEqual(dina.id);
      expect(updatedPrivateChat.user_id).toEqual(andi.id);
    });

    it('should return exception if friend id or user id is not found when update contact', async () => {
      const [andi, dina] = await prismaService.users.findMany({
        select: { id: true },
        where: {
          OR: [{ username: 'andi' }, { username: 'dina' }],
        },
      });

      const privateChatId = await prismaService.contact.findFirst({
        select: { id: true },
        where: {
          OR: [{ user_id: andi.id }, { user_id: dina.id }],
        },
      });
      const createPrivateChatDto = {
        user_id: 'andi_bukan_user',
        friends_id: 'dina',
      };

      await expect(
        privateChatService.update(privateChatId.id, createPrivateChatDto),
      ).rejects.toThrowError();
    });

    it('should remove private chat contact', async () => {
      const [andi, dina] = await prismaService.users.findMany({
        select: { id: true },
        where: {
          OR: [{ username: 'andi' }, { username: 'dina' }],
        },
      });

      const privateChatId = await prismaService.contact.findFirst({
        select: { id: true },
        where: {
          OR: [{ user_id: andi.id }, { user_id: dina.id }],
        },
      });

      await expect(
        privateChatService.remove([privateChatId.id]),
      ).resolves.toBeUndefined();
    });

    it('should return exception if contact not found', async () => {
      await expect(
        privateChatService.remove(['not_exist_id']),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
