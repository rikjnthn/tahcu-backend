import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OtpService } from 'src/common/otp/otp.service';
import { RedisService } from 'src/common/redis/redis.service';
import { OtpModule } from 'src/common/otp/otp.module';

describe('UsersService', () => {
  describe('Unit Testing', () => {
    let prismaService: PrismaService;
    let otpService: OtpService;
    let redisService: RedisService;
    let usersService: UsersService;

    beforeAll(async () => {
      prismaService = new PrismaService();
      redisService = new RedisService();
      otpService = new OtpService(redisService);
      usersService = new UsersService(prismaService, otpService);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(usersService).toBeDefined();
    });

    it('should create users and return records', async () => {
      const createUserDto = {
        email: 'tes@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const createdUserMock = {
        id: '1',
        email: 'test@email.com',
        user_id: 'test123',
        username: 'test123',
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
          email: 'test@email.com',
          user_id: 'test123',
          username: 'test123',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(usersService, 'find').mockResolvedValue(userFoundMock);

      const users = await usersService.find('tes');

      expect(usersService.find).toBeCalled();
      expect(usersService.find).toBeCalledWith('tes');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users).toEqual(userFoundMock);
    });

    it('should return empty array if users not found', async () => {
      jest.spyOn(usersService, 'find').mockResolvedValue([]);

      const users = await usersService.find('non_exist_id');

      expect(users).toEqual([]);
    });

    it('should find user with id', async () => {
      const userFoundMock = {
        id: '1',
        email: 'test@email.com',
        user_id: 'test123',
        password: 'password',
        username: 'test123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(userFoundMock);

      const user = await usersService.findOne('test123');

      expect(usersService.findOne);
      expect(usersService.findOne).toBeCalledWith('test123');

      expect(user).toEqual(userFoundMock);
    });

    it('should return exception if user not found with id', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'User was not found',
        },
      });

      jest.spyOn(usersService, 'findOne').mockRejectedValue(error);

      await expect(usersService.findOne('non_exist_id')).rejects.toThrow(error);
    });

    it('should update users and return record', async () => {
      const updateUserDto = {
        user_id: 'changed123',
        username: 'changed123',
      };

      const updatedUserMock = {
        id: '1',
        email: 'tes@email.com',
        user_id: 'changed123',
        password: 'password',
        username: 'changed123',
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
      jest.spyOn(usersService, 'remove').mockResolvedValue(undefined);

      const shouldBeUndefined = await usersService.remove('1');

      expect(usersService.remove).toBeCalled();
      expect(usersService.remove).toBeCalledWith('1');

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return exception if user that want to be remove not exist', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'User to delete does not exist',
        },
      });

      jest.spyOn(usersService, 'remove').mockRejectedValue(error);

      await expect(usersService.remove('non_exist_id')).rejects.toThrow(error);
    });

    it('should change password', async () => {
      const changePasswordDto = {
        current_password: 'password',
        new_password: 'new_password',
      };

      jest.spyOn(usersService, 'changePassword').mockResolvedValue(undefined);

      const shouldBeUndefined = await usersService.changePassword(
        '1',
        changePasswordDto,
      );

      expect(usersService.changePassword).toBeCalled();
      expect(usersService.changePassword).toBeCalledWith(
        '1',
        changePasswordDto,
      );

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should throw error if current_password wrong', async () => {
      const changePasswordDto = {
        current_password: 'wrong_password',
        new_password: 'new_password',
      };

      const error = new BadRequestException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Wrong password',
        },
      });

      jest.spyOn(usersService, 'changePassword').mockRejectedValue(error);

      await expect(
        usersService.changePassword('1', changePasswordDto),
      ).rejects.toThrow(error);
    });

    it('should change email', async () => {
      const changeEmailDto = {
        email: 'changed@email.com',
        otp: '1234',
      };

      const updatedUserData = {
        id: '1',
        email: 'changed@email.com',
        user_id: 'changed123',
        username: 'changed123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(usersService, 'changeEmail')
        .mockResolvedValue(updatedUserData);

      const updatedUser = await usersService.changeEmail('1', changeEmailDto);

      expect(usersService.changeEmail).toBeCalled();
      expect(usersService.changeEmail).toBeCalledWith('1', changeEmailDto);

      expect(updatedUser).toEqual(updatedUserData);
    });

    it('should change email', async () => {
      const changeEmailDto = {
        email: 'changed@email.com',
        otp: '1234',
      };

      const usersData = {
        id: 'user_id',
        email: 'changed@email.com',
        user_id: 'test123',
        username: 'test123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'changeEmail').mockResolvedValue(usersData);

      const updatedUser = await usersService.changeEmail(
        usersData.id,
        changeEmailDto,
      );

      expect(updatedUser.email).toBe(changeEmailDto.email);
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });

  describe('Integration Testing', () => {
    let prismaService: PrismaService;
    let otpService: OtpService;
    let redisService: RedisService;
    let usersService: UsersService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [JwtModule, PrismaModule, OtpModule],
        providers: [UsersService],
      }).compile();

      prismaService = module.get(PrismaService);
      otpService = module.get(OtpService);
      redisService = module.get(RedisService);
      usersService = module.get(UsersService);
    });

    afterEach(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });

    it('should be defined', () => {
      expect(usersService).toBeDefined();
    });

    it('should create user and return record', async () => {
      const createUserDto = {
        email: 'test@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const createdUser = await usersService.create(createUserDto);

      expect(createdUser.email).toBe(createUserDto.email);
      expect(createdUser.user_id).toBe(createUserDto.user_id);
      expect(createdUser.username).toBe(createUserDto.username);
    });

    it('should find users with prefix id query', async () => {
      const createUserDto = {
        email: 'test@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      await usersService.create(createUserDto);

      const users = await usersService.find('test123');

      expect(Array.isArray(users)).toBeTruthy();

      const user = users[0];

      expect(user.email).toBe(createUserDto.email);
      expect(user.user_id).toBe(createUserDto.user_id);
      expect(user.username).toBe(createUserDto.username);
    });

    it('should return empty array if users not found with prefix id query', async () => {
      const users = await usersService.find('test1234');

      expect(users).toEqual([]);
    });

    it('should return user by id', async () => {
      const createUserDto = {
        email: 'test@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const createdUser = await usersService.create(createUserDto);

      const user = await usersService.findOne(createdUser.id);

      expect(user.email).toBe(createUserDto.email);
      expect(user.user_id).toBe(createUserDto.user_id);
      expect(user.username).toBe(createUserDto.username);
    });

    it('should return exception if user not found', async () => {
      await expect(usersService.findOne('not_exist')).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'User was not found',
          },
        }),
      );
    });

    it('should update user and return record', async () => {
      const createUserDto = {
        email: 'test@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const createdUser = await usersService.create(createUserDto);

      const updateUserDto = {
        user_id: 'changed123',
        username: 'changed123',
      };

      const updatedUser = await usersService.update(
        createdUser.id,
        updateUserDto,
      );

      expect(updatedUser.user_id).toBe(updateUserDto.user_id);
      expect(updatedUser.username).toBe(updateUserDto.username);
    });

    it('should remove user', async () => {
      const createUserDto = {
        email: 'test@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const createdUser = await usersService.create(createUserDto);

      await expect(
        usersService.remove(createdUser.id),
      ).resolves.toBeUndefined();

      const findUser = await usersService.find(createdUser.user_id);

      expect(findUser).toEqual([]);
    });

    it('should return exception when remove users that not exist', async () => {
      await expect(usersService.remove('not_exist')).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'User to delete does not exist',
          },
        }),
      );
    });

    it('should change password', async () => {
      const createUserDto = {
        email: 'test@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const createdUser = await usersService.create(createUserDto);

      const changePasswordDto = {
        current_password: 'password',
        new_password: 'new_password',
      };

      await usersService.changePassword(createdUser.id, changePasswordDto);

      const user = await prismaService.users.findFirst({
        where: { id: createdUser.id },
      });

      expect(
        bcrypt.compareSync(changePasswordDto.new_password, user.password),
      ).toBeTruthy();
    });

    it('should throw error if current_password wrong', async () => {
      const createUserDto = {
        email: 'test@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const createdUser = await usersService.create(createUserDto);

      const changePasswordDto = {
        current_password: 'wrong_password',
        new_password: 'new_password',
      };

      await expect(
        usersService.changePassword(createdUser.id, changePasswordDto),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Wrong password',
          },
        }),
      );
    });

    it('should change email', async () => {
      const otp = await otpService.generateOtp('changed@email.com');

      const changeEmailDto = {
        email: 'changed@email.com',
        otp,
      };

      const createUserDto = {
        email: 'test@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const createdUser = await usersService.create(createUserDto);

      const updatedUser = await usersService.changeEmail(
        createdUser.id,
        changeEmailDto,
      );

      expect(updatedUser.email).toBe(changeEmailDto.email);
    });

    afterAll(async () => {
      await redisService.quit();
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
