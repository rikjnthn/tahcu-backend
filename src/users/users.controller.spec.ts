import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import * as bcrypt from 'bcrypt';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OtpService } from 'src/common/otp/otp.service';
import { RedisService } from 'src/common/redis/redis.service';
import { OtpModule } from 'src/common/otp/otp.module';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  describe('Unit Testing', () => {
    let prismaService: PrismaService;
    let otpService: OtpService;
    let redisService: RedisService;
    let usersService: UsersService;
    let usersController: UsersController;

    beforeAll(async () => {
      prismaService = new PrismaService();
      redisService = new RedisService();
      otpService = new OtpService(redisService);
      usersService = new UsersService(prismaService, otpService);
      usersController = new UsersController(usersService);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(usersController).toBeDefined();
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

      jest.spyOn(usersController, 'find').mockResolvedValue(userFoundMock);

      const users = await usersController.find('tes');

      expect(usersController.find).toBeCalled();
      expect(usersController.find).toBeCalledWith('tes');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users).toEqual(userFoundMock);
    });

    it('should return empty array if users not found', async () => {
      jest.spyOn(usersController, 'find').mockResolvedValue([]);

      const users = await usersController.find('non_exist_id');

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

      jest.spyOn(usersController, 'findOne').mockResolvedValue(userFoundMock);

      const user = await usersController.findOne('test123');

      expect(usersController.findOne);
      expect(usersController.findOne).toBeCalledWith('test123');

      expect(user).toEqual(userFoundMock);
    });

    it('should return exception if user not found with id', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'User was not found',
        },
      });

      jest.spyOn(usersController, 'findOne').mockRejectedValue(error);

      await expect(usersController.findOne('non_exist_id')).rejects.toThrow(
        error,
      );
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

      jest.spyOn(usersController, 'update').mockResolvedValue(updatedUserMock);

      const updatedUser = await usersController.update('1', updateUserDto);

      expect(usersController.update).toBeCalled();
      expect(usersController.update).toBeCalledWith('1', updateUserDto);

      expect(updatedUser).toEqual(updatedUserMock);
    });

    it('should remove user', async () => {
      jest.spyOn(usersController, 'remove').mockResolvedValue(undefined);

      const shouldBeUndefined = await usersController.remove('1');

      expect(usersController.remove).toBeCalled();
      expect(usersController.remove).toBeCalledWith('1');

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return exception if user that want to be remove not exist', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'User to delete does not exist',
        },
      });

      jest.spyOn(usersController, 'remove').mockRejectedValue(error);

      await expect(usersController.remove('non_exist_id')).rejects.toThrow(
        error,
      );
    });

    it('should change password', async () => {
      const changePasswordDto = {
        current_password: 'password',
        new_password: 'new_password',
      };

      jest
        .spyOn(usersController, 'changePassword')
        .mockResolvedValue(undefined);

      const shouldBeUndefined = await usersController.changePassword(
        changePasswordDto,
        'user_id',
      );

      expect(usersController.changePassword).toBeCalled();
      expect(usersController.changePassword).toBeCalledWith(
        changePasswordDto,
        'user_id',
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

      jest.spyOn(usersController, 'changePassword').mockRejectedValue(error);

      await expect(
        usersController.changePassword(changePasswordDto, 'user_id'),
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
        .spyOn(usersController, 'changeEmail')
        .mockResolvedValue(updatedUserData);

      const updatedUser = await usersController.changeEmail(
        changeEmailDto,
        'user_id',
      );

      expect(usersController.changeEmail).toBeCalled();
      expect(usersController.changeEmail).toBeCalledWith(
        changeEmailDto,
        'user_id',
      );

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

      jest.spyOn(usersController, 'changeEmail').mockResolvedValue(usersData);

      const updatedUser = await usersController.changeEmail(
        changeEmailDto,
        usersData.id,
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
    let usersController: UsersController;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
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
          PrismaModule,
          OtpModule,
        ],
        providers: [UsersService],
        controllers: [UsersController],
      }).compile();

      prismaService = module.get(PrismaService);
      otpService = module.get(OtpService);
      redisService = module.get(RedisService);
      usersService = module.get(UsersService);
      usersController = module.get(UsersController);
    });

    afterEach(async () => {
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });

    it('should be defined', () => {
      expect(usersController).toBeDefined();
    });

    it('should find users with prefix id query', async () => {
      const createUserDto = {
        email: 'test@email.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      await usersService.create(createUserDto);

      const users = await usersController.find('test123');

      expect(Array.isArray(users)).toBeTruthy();

      const user = users[0];

      expect(user.email).toBe(createUserDto.email);
      expect(user.user_id).toBe(createUserDto.user_id);
      expect(user.username).toBe(createUserDto.username);
    });

    it('should return empty array if users not found with prefix id query', async () => {
      const users = await usersController.find('test1234');

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

      const user = await usersController.findOne(createdUser.id);

      expect(user.email).toBe(createUserDto.email);
      expect(user.user_id).toBe(createUserDto.user_id);
      expect(user.username).toBe(createUserDto.username);
    });

    it('should return exception if user not found', async () => {
      await expect(usersController.findOne('not_exist')).rejects.toThrow(
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

      const updatedUser = await usersController.update(
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
        usersController.remove(createdUser.id),
      ).resolves.toBeUndefined();

      const findUser = await usersController.find(createdUser.user_id);

      expect(findUser).toEqual([]);
    });

    it('should return exception when remove users that not exist', async () => {
      await expect(usersController.remove('not_exist')).rejects.toThrow(
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

      await usersController.changePassword(changePasswordDto, createdUser.id);

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
        usersController.changePassword(changePasswordDto, createdUser.id),
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

      const updatedUser = await usersController.changeEmail(
        changeEmailDto,
        createdUser.id,
      );

      expect(updatedUser.email).toBe(changeEmailDto.email);
    });

    afterAll(async () => {
      await redisService.quit();
      await prismaService.$transaction([prismaService.users.deleteMany()]);
    });
  });
});
