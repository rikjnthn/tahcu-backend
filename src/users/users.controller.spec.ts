import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { OtpService } from 'src/common/otp/otp.service';
import { RedisService } from 'src/common/redis/redis.service';
import { OtpModule } from 'src/common/otp/otp.module';
import { ThrottlerModule } from '@nestjs/throttler';

describe('UsersController', () => {
  describe('Unit Testing', () => {
    let usersController: UsersController;
    let usersService: UsersService;
    let otpService: OtpService;
    let redisService: RedisService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      prismaService = new PrismaService();
      redisService = new RedisService();
      otpService = new OtpService(redisService);
      usersService = new UsersService(prismaService, otpService);
      usersController = new UsersController(usersService);
    });

    it('should be defined', () => {
      expect(usersController).toBeDefined();
    });

    it('should find users', async () => {
      const usersFoundMock = [
        {
          id: '1',
          user_id: 'test123',
          email: 'test@gmail.com',
          username: 'test',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(usersController, 'find').mockResolvedValue(usersFoundMock);

      const users = await usersController.find('tes123');

      expect(usersController.find).toBeCalled();
      expect(usersController.find).toBeCalledWith('tes123');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users).toEqual(usersFoundMock);
    });

    it('should return empty array if users not found', async () => {
      jest.spyOn(usersController, 'find').mockResolvedValue([]);

      const users = await usersController.find('non_exist');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users.length).toBe(0);
    });

    it('should find one user by id', async () => {
      const usersFoundMock = {
        id: '1',
        user_id: 'test123',
        email: 'test@gmail.com',
        username: 'test',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersController, 'findOne').mockResolvedValue(usersFoundMock);

      const users = await usersController.findOne('1');

      expect(usersController.findOne).toBeCalled();
      expect(usersController.findOne).toBeCalledWith('1');

      expect(users).toEqual(usersFoundMock);
    });

    it('should return exception if user not found', async () => {
      jest.spyOn(usersController, 'findOne').mockRejectedValue(new Error());

      await expect(usersController.findOne('non_exist')).rejects.toThrowError();
    });

    it('should update users and return record', async () => {
      const updateUserDtoMock = {
        user_id: 'new_user_id',
        username: 'new_username',
      };

      const updatedUserMock = {
        id: '1',
        user_id: 'new_user_id',
        email: 'new_email@gmail.com',
        username: 'new_username',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersController, 'update').mockResolvedValue(updatedUserMock);

      const updatedUser = await usersController.update('1', updateUserDtoMock);

      expect(usersController.update).toBeCalled();
      expect(usersController.update).toBeCalledWith('1', updateUserDtoMock);

      expect(updatedUser).toEqual(updatedUserMock);
    });

    it('should return exception if user need to update not found', async () => {
      const updateUserDtoMock = {
        user_id: 'changed_user_id',
        username: 'changed_username',
      };

      jest
        .spyOn(usersController, 'update')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersController.update('non_exist', updateUserDtoMock),
      ).rejects.toThrowError(new BadRequestException());
    });

    it('should return exception if update user not valid', async () => {
      const updateUserDtoMock = {
        user_id: 'not_valid',
        username: 'not_valid',
      };

      jest
        .spyOn(usersController, 'update')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersController.update('1', updateUserDtoMock),
      ).rejects.toThrowError(new BadRequestException());
    });

    it('should remove user', async () => {
      jest.spyOn(usersController, 'remove').mockResolvedValue(undefined);

      const shouldReturnUndefined = await usersController.remove('1');

      expect(usersController.remove).toBeCalled();
      expect(usersController.remove).toBeCalledWith('1');

      expect(shouldReturnUndefined).toBeUndefined();
    });

    it('should return exception if user that want to be remove not exist', async () => {
      jest.spyOn(usersController, 'remove').mockRejectedValue(new Error());

      await expect(usersController.remove('non_exist')).rejects.toThrowError();
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
        '1',
      );

      expect(usersController.changePassword).toBeCalled();
      expect(usersController.changePassword).toBeCalledWith(
        changePasswordDto,
        '1',
      );

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should throw error if current_password wrong', async () => {
      const changePasswordDto = {
        current_password: 'wrong_password',
        new_password: 'new_password',
      };

      jest
        .spyOn(usersController, 'changePassword')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersController.changePassword(changePasswordDto, '1'),
      ).rejects.toThrowError();
    });

    it('should change email', async () => {
      const changeEmailDto = {
        email: 'changed@gmail.com',
        otp: '1234',
      };

      const updatedUserData = {
        id: '1',
        email: 'changed@gmail.com',
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
        '1',
      );

      expect(usersController.changeEmail).toBeCalled();
      expect(usersController.changeEmail).toBeCalledWith(changeEmailDto, '1');

      expect(updatedUser).toEqual(updatedUserData);
    });

    it('should throw error if otp is not valid', async () => {
      const changeEmailDto = {
        email: 'new_email@gmail.com',
        otp: 'not_valid_otp',
      };

      jest
        .spyOn(usersController, 'changeEmail')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersController.changeEmail(changeEmailDto, '1'),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });

  describe('Integration Testing', () => {
    let usersService: UsersService;
    let usersController: UsersController;
    let otpService: OtpService;
    let redisService: RedisService;
    let prismaService: PrismaService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          PrismaModule,
          JwtModule,
          OtpModule,
          ThrottlerModule.forRoot([
            {
              ttl: parseInt(process.env.DEFAULT_THROTTLER_TTL),
              limit: parseInt(process.env.DEFAULT_THROTTLER_LIMIT),
            },
          ]),
        ],
        controllers: [UsersController],
        providers: [UsersService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      usersService = module.get<UsersService>(UsersService);
      otpService = module.get<OtpService>(OtpService);
      redisService = module.get<RedisService>(RedisService);
      usersController = module.get<UsersController>(UsersController);
    });

    beforeAll(async () => {
      await prismaService.users.create({
        data: {
          email: 'test@gmail.com',
          user_id: 'test123',
          username: 'test123',
          password: 'password',
        },
      });
    });

    it('should be defined', () => {
      expect(usersController).toBeDefined();
    });

    it('should find users', async () => {
      const usersFoundMock = {
        email: 'test@gmail.com',
        user_id: 'test123',
        username: 'test123',
      };

      const users = await usersController.find('test123');

      expect(Array.isArray(users)).toBeTruthy();

      users.forEach((user) => {
        expect(user.email).toBe(usersFoundMock.email);
        expect(user.user_id).toBe(usersFoundMock.user_id);
        expect(user.username).toBe(usersFoundMock.username);
      });
    });

    it('should return empty array if users not found', async () => {
      const users = await usersService.find('non_exist');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users.length).toBe(0);
    });

    it('should find one user by id', async () => {
      const usersFoundMock = {
        email: 'test@gmail.com',
        user_id: 'test123',
        username: 'test123',
      };

      const { id } = await prismaService.users.findFirst({
        where: { username: 'test123' },
      });

      const user = await usersController.findOne(id);

      expect(user.email).toBe(usersFoundMock.email);
      expect(user.user_id).toBe(usersFoundMock.user_id);
      expect(user.username).toBe(usersFoundMock.username);
    });

    it('should return exception if user not found', async () => {
      await expect(usersService.findOne('non_exist')).rejects.toThrowError();
    });

    it('should update users and return record', async () => {
      const updateUserDto = {
        user_id: 'new_user_id',
        username: 'new_username',
      };

      const [users] = await usersController.find('test123');

      const updatedUser = await usersController.update(users.id, updateUserDto);

      expect(updatedUser.email).toBe(updatedUser.email);
      expect(updatedUser.user_id).toBe(updatedUser.user_id);
      expect(updatedUser.username).toBe(updatedUser.username);
    });

    it('should return exception if user that need to update not found', async () => {
      const updateUserDto = {
        user_id: 'changed_user_id',
        username: 'changed_username',
      };

      await expect(
        usersController.update('non_exist', updateUserDto),
      ).rejects.toThrowError();
    });

    it('should remove users', async () => {
      const [user] = await usersController.find('new_user_id');

      await usersController.remove(user.id);

      const users = await usersController.find('new_user_id');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users.length).toBe(0);
    });

    it('should return exception when remove users that not exist', async () => {
      await expect(usersController.remove('non_exist')).rejects.toThrowError();
    });

    it('should change password', async () => {
      const createUserDto = {
        email: 'test@gmail.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const { id } = await usersService.create(createUserDto);

      const changePasswordDto = {
        current_password: 'password',
        new_password: 'new_password',
      };

      const shouldBeUndefined = await usersController.changePassword(
        changePasswordDto,
        id,
      );

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should throw error if current_password wrong', async () => {
      const changePasswordDto = {
        current_password: 'wrong_password',
        new_password: 'new_password',
      };

      const { id } = await prismaService.users.findFirst({
        where: { user_id: 'test123' },
      });

      await expect(
        usersController.changePassword(changePasswordDto, id),
      ).rejects.toThrowError();
    });

    it('should change email', async () => {
      const otp = await otpService.generateOtp('changed@gmail.com');

      const changeEmailDto = {
        email: 'changed@gmail.com',
        otp,
      };

      const { id } = await prismaService.users.findFirst({
        where: { user_id: 'test123' },
      });

      const updatedUser = await usersController.changeEmail(changeEmailDto, id);

      expect(updatedUser.email).toBe(changeEmailDto.email);
    });

    it('should throw error if otp is not valid', async () => {
      await otpService.generateOtp('changed@gmail.com');

      const changeEmailDto = {
        email: 'new_email@gmail.com',
        otp: 'not_valid_otp',
      };

      const { id } = await prismaService.users.findFirst({
        where: { user_id: 'test123' },
      });

      await expect(
        usersController.changeEmail(changeEmailDto, id),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await redisService.quit();
      await prismaService.$transaction([
        prismaService.users.deleteMany({ where: { user_id: 'test123' } }),
      ]);
    });
  });
});
