import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaService } from 'src/common/prisma/prisma.service';

describe('UsersController', () => {
  describe('Unit Testing', () => {
    let usersController: UsersController;
    let usersService: UsersService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      prismaService = new PrismaService();
      usersService = new UsersService(prismaService);
      usersController = new UsersController(usersService);
    });

    it('should be defined', () => {
      expect(usersController).toBeDefined();
    });

    it('should find users', async () => {
      const usersFoundMock = [
        {
          id: '1',
          user_id: 'tes123',
          email: 'tes@gmail.com',
          is_active: true,
          username: 'test',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(usersService, 'find').mockResolvedValue(usersFoundMock);

      const users = await usersController.find('tes123');

      expect(usersService.find).toBeCalled();
      expect(usersService.find).toBeCalledWith('tes123');

      expect(users).toEqual(usersFoundMock);
    });

    it('should update users and return record', async () => {
      const updateUserDtoMock = {
        user_id: 'akun_baru',
        email: 'emailbaru@gmail.com',
        is_active: true,
        password: 'password_baru',
        username: 'username_baru',
      };

      const updatedUserMock = {
        id: '1',
        user_id: 'akun_baru',
        email: 'emailbaru@gmail.com',
        is_active: true,
        username: 'username_baru',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUserMock);

      const updatedUser = await usersController.update('1', updateUserDtoMock);

      expect(usersService.update).toBeCalled();
      expect(usersService.update).toBeCalledWith('1', updateUserDtoMock);

      expect(updatedUser).toEqual(updatedUserMock);
    });

    it('should remove user', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(null);

      await usersController.remove('1');

      expect(usersService.remove).toBeCalled();
      expect(usersService.remove).toBeCalledWith('1');
    });
  });

  describe('Integration Testing', () => {
    let usersService: UsersService;
    let usersController: UsersController;
    let prismaService: PrismaService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [PrismaModule, JwtModule],
        controllers: [UsersController],
        providers: [UsersService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      usersService = module.get<UsersService>(UsersService);
      usersController = module.get<UsersController>(UsersController);
    });

    beforeAll(async () => {
      await usersService.create({
        email: 'tes@gmail.com',
        user_id: 'tes123',
        is_active: true,
        username: 'test',
        password: 'password',
      });
    });

    it('should be defined', () => {
      expect(usersController).toBeDefined();
    });

    it('should find users', async () => {
      const usersFoundMock = {
        email: 'tes@gmail.com',
        user_id: 'tes123',
        is_active: true,
        username: 'test',
      };

      const users = await usersController.find('tes123');

      expect(Array.isArray(users)).toBeTruthy();

      users.forEach((user) => {
        expect(user.email).toBe(usersFoundMock.email);
        expect(user.user_id).toBe(usersFoundMock.user_id);
        expect(user.is_active).toBe(usersFoundMock.is_active);
        expect(user.username).toBe(usersFoundMock.username);
      });
    });

    it('should return empty array if users not found', async () => {
      const users = await usersService.find('tess');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users.length).toBe(0);
    });

    it('should update users and return record', async () => {
      const updateUserDto = {
        user_id: 'tes_banget',
        is_active: true,
        username: 'test_banget',
      };

      const [users] = await usersController.find('tes123');

      const updatedUser = await usersController.update(users.id, updateUserDto);

      expect(updatedUser.email).toBe(updatedUser.email);
      expect(updatedUser.user_id).toBe(updatedUser.user_id);
      expect(updatedUser.is_active).toBe(updatedUser.is_active);
      expect(updatedUser.username).toBe(updatedUser.username);
    });

    it('should remove users', async () => {
      const [user] = await usersController.find('tes_banget');
      await usersController.remove(user.id);

      const users = await usersController.find('tes_banget');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users.length).toBe(0);
    });

    afterAll(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
