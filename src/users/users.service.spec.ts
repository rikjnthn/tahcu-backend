import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaService } from 'src/common/prisma/prisma.service';

describe('UsersService', () => {
  describe('Unit Testing', () => {
    let usersService: UsersService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      prismaService = new PrismaService();
      usersService = new UsersService(prismaService);
    });

    it('should be defined', () => {
      expect(usersService).toBeDefined();
    });

    it('should create users and return records', async () => {
      const createUserDto = {
        email: 'tes@gmail.com',
        phone_number: '08123456789',
        is_active: true,
        password: 'password',
        user_id: 'tes123',
        username: 'tes123',
      };

      const createdUserMock = {
        id: '1',
        email: 'tes@gmail.com',
        phone_number: '08123456789',
        is_active: true,
        user_id: 'tes123',
        username: 'tes123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(createdUserMock);

      const createdUser = await usersService.create(createUserDto);

      expect(usersService.create).toBeCalled();
      expect(usersService.create).toBeCalledWith(createUserDto);

      expect(createdUser).toEqual(createdUserMock);
    });

    it('should find users with prefix id query', async () => {
      const userFoundMock = [
        {
          id: '1',
          email: 'tes@gmail.com',
          is_active: true,
          user_id: 'tes123',
          username: 'tes123',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(usersService, 'find').mockResolvedValue(userFoundMock);

      const users = await usersService.find('tes');

      expect(usersService.find).toBeCalled();
      expect(usersService.find).toBeCalledWith('tes');

      expect(users).toEqual(userFoundMock);
    });

    it('should return empty array if users not found', async () => {
      jest.spyOn(usersService, 'find').mockResolvedValue([]);

      const users = await usersService.find('y');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users.length).toBe(0);
    });

    it('should find user with id', async () => {
      const userFoundMock = {
        id: '1',
        email: 'tes@gmail.com',
        is_active: true,
        user_id: 'tes123',
        password: 'password',
        username: 'tes123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(userFoundMock);

      const user = await usersService.findOne('tes123');

      expect(usersService.findOne);
      expect(usersService.findOne).toBeCalledWith('tes123');

      expect(user).toEqual(userFoundMock);
    });

    it('should return exception if user not found with id', async () => {
      jest.spyOn(usersService, 'findOne').mockRejectedValue(new Error());

      await expect(usersService.findOne('a')).rejects.toThrowError();
    });

    it('should update users and return record', async () => {
      const updateUserDto = {
        email: 'ganti@gmail.com',
        is_active: true,
        user_id: 'ganti123',
        password: 'ganti_password',
        username: 'ganti123',
      };

      const updatedUserMock = {
        id: '1',
        email: 'ganti@gmail.com',
        is_active: true,
        user_id: 'ganti123',
        password: 'ganti_password',
        username: 'ganti123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUserMock);

      const updatedUser = await usersService.update('1', updateUserDto);

      expect(usersService.update).toBeCalled();
      expect(usersService.update).toBeCalledWith('1', updateUserDto);

      expect(updatedUser).toEqual(updatedUserMock);
    });

    it('should return exception if user need to update not found', async () => {
      const updateUserDtoMock = {
        user_id: 'akun_baru',
        email: 'emailbaru@gmail.com',
        is_active: true,
        password: 'password_baru',
        username: 'username_baru',
      };

      jest
        .spyOn(usersService, 'update')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersService.update('k', updateUserDtoMock),
      ).rejects.toThrowError(new BadRequestException());
    });

    it('should return exception if update user not valid', async () => {
      const updateUserDtoMock = {
        user_id: '0',
        email: '@gmail.com',
        is_active: true,
        password: '0',
        username: '0',
      };

      jest
        .spyOn(usersService, 'update')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersService.update('k', updateUserDtoMock),
      ).rejects.toThrowError(new BadRequestException());
    });

    it('should remove user', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(null);

      await usersService.remove('1');

      expect(usersService.remove).toBeCalled();
      expect(usersService.remove).toBeCalledWith('1');
    });

    it('should return exception if user that want to be remove not exist', async () => {
      jest.spyOn(usersService, 'remove').mockRejectedValue(new Error());

      await expect(usersService.remove('k')).rejects.toThrowError();
    });
  });

  describe('Integration Testing', () => {
    let usersService: UsersService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [JwtModule, PrismaModule],
        providers: [UsersService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      usersService = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
      expect(usersService).toBeDefined();
    });

    it('should create user and return record', async () => {
      const createUserDto = {
        email: 'tes@gmail.com',
        phone_number: '08123456789',
        is_active: true,
        password: 'password',
        user_id: 'tes123',
        username: 'tes123',
      };

      const createdUser = await usersService.create(createUserDto);

      expect(createdUser.email).toBe(createUserDto.email);
      expect(createdUser.is_active).toBe(createUserDto.is_active);
      expect(createdUser.user_id).toBe(createUserDto.user_id);
      expect(createdUser.username).toBe(createUserDto.username);
    });

    it('should find users with prefix id query', async () => {
      const usersFoundMock = {
        email: 'tes@gmail.com',
        is_active: true,
        user_id: 'tes123',
        username: 'tes123',
      };

      const users = await usersService.find('tes123');

      expect(Array.isArray(users)).toBeTruthy();

      users.forEach((user) => {
        expect(user.email).toBe(usersFoundMock.email);
        expect(user.user_id).toBe(usersFoundMock.user_id);
        expect(user.is_active).toBe(usersFoundMock.is_active);
        expect(user.username).toBe(usersFoundMock.username);
      });
    });

    it('should return empty array if users not found with prefix id query', async () => {
      const users = await usersService.find('tes1234');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users.length).toBe(0);
    });

    it('should return user by id', async () => {
      const usersFoundMock = {
        email: 'tes@gmail.com',
        is_active: true,
        user_id: 'tes123',
        username: 'tes123',
      };
      const { id } = await prismaService.users.findFirst({
        where: { user_id: 'tes123' },
      });

      const user = await usersService.findOne(id);

      expect(user.email).toBe(usersFoundMock.email);
      expect(user.user_id).toBe(usersFoundMock.user_id);
      expect(user.is_active).toBe(usersFoundMock.is_active);
      expect(user.username).toBe(usersFoundMock.username);
    });

    it('should return exception if user not found', async () => {
      await expect(usersService.findOne('not_exist')).rejects.toThrowError();
    });

    it('should update user and return record', async () => {
      const updateUserDto = {
        email: 'ganti@gmail.com',
        is_active: true,
        user_id: 'ganti123',
        password: 'ganti_password',
        username: 'ganti123',
      };

      const { id } = await prismaService.users.findFirst({
        where: { user_id: 'tes123' },
      });

      const user = await usersService.findOne(id);

      const updatedUser = await usersService.update(user.id, updateUserDto);

      expect(updatedUser.email).toBe(updateUserDto.email);
      expect(updatedUser.user_id).toBe(updateUserDto.user_id);
      expect(updatedUser.is_active).toBe(updateUserDto.is_active);
      expect(updatedUser.username).toBe(updateUserDto.username);
    });

    it('should return exception if user that need to update not found', async () => {
      const updateUserDto = {
        email: 'ganti@gmail.com',
        is_active: true,
        user_id: 'ganti123',
        password: 'ganti_password',
        username: 'ganti123',
      };

      await expect(
        usersService.update('1', updateUserDto),
      ).rejects.toThrowError();
    });

    it('should remove user', async () => {
      const user = await prismaService.users.findFirst({
        where: { username: 'ganti123' },
      });

      await expect(usersService.remove(user.id)).resolves.toBeUndefined();

      const findUser = await usersService.find(user.user_id);

      expect(findUser.length).toBe(0);
    });

    it('should return exception when remove users that not exist', async () => {
      await expect(usersService.remove('1')).rejects.toThrowError();
    });

    afterAll(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
