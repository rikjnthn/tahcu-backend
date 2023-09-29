import { Test, TestingModule } from '@nestjs/testing';
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
        is_active: true,
        password: 'password',
        user_id: 'tes123',
        username: 'tes123',
      };

      const createdUserMock = {
        id: '1',
        email: 'tes@gmail.com',
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

      jest.spyOn(usersService, 'findOneId').mockResolvedValue(userFoundMock);

      const user = await usersService.findOneId('tes123');

      expect(usersService.findOneId);
      expect(usersService.findOneId).toBeCalledWith('tes123');

      expect(user).toEqual(userFoundMock);
    });

    it('should find user with email', async () => {
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

      jest.spyOn(usersService, 'findOneEmail').mockResolvedValue(userFoundMock);

      const user = await usersService.findOneEmail('tes@gmail.com');

      expect(usersService.findOneEmail);
      expect(usersService.findOneEmail).toBeCalledWith('tes@gmail.com');

      expect(user).toEqual(userFoundMock);
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

    it('should remove user', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(null);

      await usersService.remove('1');

      expect(usersService.remove).toBeCalled();
      expect(usersService.remove).toBeCalledWith('1');
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

    it('should return user with id query', async () => {
      const usersFoundMock = {
        email: 'tes@gmail.com',
        is_active: true,
        user_id: 'tes123',
        username: 'tes123',
      };

      const user = await usersService.findOneId('tes123');

      expect(user.email).toBe(usersFoundMock.email);
      expect(user.user_id).toBe(usersFoundMock.user_id);
      expect(user.is_active).toBe(usersFoundMock.is_active);
      expect(user.username).toBe(usersFoundMock.username);
    });

    it('should return undefined if user not found id query', async () => {
      const user = await usersService.findOneId('tes1234');

      expect(user).toBeNull();
    });

    it('should return user with email query', async () => {
      const usersFoundMock = {
        email: 'tes@gmail.com',
        is_active: true,
        user_id: 'tes123',
        username: 'tes123',
      };

      const user = await usersService.findOneEmail('tes@gmail.com');

      expect(user.email).toBe(usersFoundMock.email);
      expect(user.user_id).toBe(usersFoundMock.user_id);
      expect(user.is_active).toBe(usersFoundMock.is_active);
      expect(user.username).toBe(usersFoundMock.username);
    });

    it('should return undefined if user not found email query', async () => {
      const user = await usersService.findOneEmail('not_found@gmail.com');

      expect(user).toBeNull();
    });

    it('should update user and return record', async () => {
      const updateUserDto = {
        email: 'ganti@gmail.com',
        is_active: true,
        user_id: 'ganti123',
        password: 'ganti_password',
        username: 'ganti123',
      };

      const user = await usersService.findOneId('tes123');

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
      const user = await usersService.findOneId('ganti123');

      await expect(usersService.remove(user.id)).resolves.toBeUndefined();

      const findUser = await usersService.findOneId('ganti123');

      expect(findUser).toBeNull();
    });

    it('should return exception when remove users that not exist', async () => {
      await expect(usersService.remove('1')).rejects.toThrowError();
    });

    afterAll(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
