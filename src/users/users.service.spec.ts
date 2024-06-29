import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
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

    it('should be defined', () => {
      expect(usersService).toBeDefined();
    });

    it('should create users and return records', async () => {
      const createUserDto = {
        email: 'tes@gmail.com',
        password: 'password',
        user_id: 'test123',
        username: 'test123',
      };

      const createdUserMock = {
        id: '1',
        email: 'test@gmail.com',
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
          email: 'test@gmail.com',
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

      expect(Array.isArray(users)).toBeTruthy();

      expect(users.length).toBe(0);
    });

    it('should find user with id', async () => {
      const userFoundMock = {
        id: '1',
        email: 'test@gmail.com',
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
      jest.spyOn(usersService, 'findOne').mockRejectedValue(new Error());

      await expect(usersService.findOne('non_exist_id')).rejects.toThrowError();
    });

    it('should update users and return record', async () => {
      const updateUserDto = {
        user_id: 'changed123',
        username: 'changed123',
      };

      const updatedUserMock = {
        id: '1',
        email: 'tes@gmail.com',
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

    it('should return exception if user need to update not found', async () => {
      const updateUserDtoMock = {
        user_id: 'user_id_baru',
        email: 'new_email@gmail.com',
        password: 'new_password',
        username: 'new_username',
      };

      jest
        .spyOn(usersService, 'update')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersService.update('non_exist_id', updateUserDtoMock),
      ).rejects.toThrowError(new BadRequestException());
    });

    it('should return exception if update user data is not valid', async () => {
      const updateUserDtoMock = {
        user_id: '0',
        username: '0',
      };

      jest
        .spyOn(usersService, 'update')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersService.update('1', updateUserDtoMock),
      ).rejects.toThrowError(new BadRequestException());
    });

    it('should remove user', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(undefined);

      const shouldBeUndefined = await usersService.remove('1');

      expect(usersService.remove).toBeCalled();
      expect(usersService.remove).toBeCalledWith('1');

      expect(shouldBeUndefined).toBeUndefined();
    });

    it('should return exception if user that want to be remove not exist', async () => {
      jest.spyOn(usersService, 'remove').mockRejectedValue(new Error());

      await expect(usersService.remove('non_exist_id')).rejects.toThrowError();
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

      jest
        .spyOn(usersService, 'changePassword')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersService.changePassword('1', changePasswordDto),
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
        .spyOn(usersService, 'changeEmail')
        .mockResolvedValue(updatedUserData);

      const updatedUser = await usersService.changeEmail('1', changeEmailDto);

      expect(usersService.changeEmail).toBeCalled();
      expect(usersService.changeEmail).toBeCalledWith('1', changeEmailDto);

      expect(updatedUser).toEqual(updatedUserData);
    });

    it('should throw error if otp is not valid', async () => {
      const changeEmailDto = {
        email: 'new_email@gmail.com',
        otp: 'not_valid_otp',
      };

      jest
        .spyOn(usersService, 'changeEmail')
        .mockRejectedValue(new BadRequestException());

      await expect(
        usersService.changeEmail('1', changeEmailDto),
      ).rejects.toThrowError();
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

      prismaService = module.get<PrismaService>(PrismaService);
      otpService = module.get<OtpService>(OtpService);
      redisService = module.get<RedisService>(RedisService);
      usersService = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
      expect(usersService).toBeDefined();
    });

    it('should create user and return record', async () => {
      const createUserDto = {
        email: 'test@gmail.com',
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
      const usersFoundMock = {
        email: 'test@gmail.com',
        user_id: 'test123',
        username: 'test123',
      };

      const users = await usersService.find('test123');

      expect(Array.isArray(users)).toBeTruthy();

      const user = users[0];

      expect(user.email).toBe(usersFoundMock.email);
      expect(user.user_id).toBe(usersFoundMock.user_id);
      expect(user.username).toBe(usersFoundMock.username);
    });

    it('should return empty array if users not found with prefix id query', async () => {
      const users = await usersService.find('test1234');

      expect(Array.isArray(users)).toBeTruthy();

      expect(users.length).toBe(0);
    });

    it('should return user by id', async () => {
      const usersFoundMock = {
        email: 'test@gmail.com',
        user_id: 'test123',
        username: 'test123',
      };
      const { id } = await prismaService.users.findFirst({
        where: { user_id: 'test123' },
      });

      const user = await usersService.findOne(id);

      expect(user.email).toBe(usersFoundMock.email);
      expect(user.user_id).toBe(usersFoundMock.user_id);
      expect(user.username).toBe(usersFoundMock.username);
    });

    it('should return exception if user not found', async () => {
      await expect(usersService.findOne('not_exist')).rejects.toThrowError();
    });

    it('should update user and return record', async () => {
      const updateUserDto = {
        user_id: 'changed123',
        username: 'changed123',
      };

      const { id } = await prismaService.users.findFirst({
        where: { user_id: 'test123' },
      });

      const updatedUser = await usersService.update(id, updateUserDto);

      expect(updatedUser.user_id).toBe(updateUserDto.user_id);
      expect(updatedUser.username).toBe(updateUserDto.username);
    });

    it('should return exception if user that need to update not found', async () => {
      const updateUserDto = {
        user_id: 'new_id123',
        username: 'new_username123',
      };

      await expect(
        usersService.update('non_exist', updateUserDto),
      ).rejects.toThrowError();
    });

    it('should remove user', async () => {
      const user = await prismaService.users.findFirst({
        where: { username: 'changed123' },
      });

      await expect(usersService.remove(user.id)).resolves.toBeUndefined();

      const findUser = await usersService.find(user.user_id);

      expect(findUser.length).toBe(0);
    });

    it('should return exception when remove users that not exist', async () => {
      await expect(usersService.remove('not_exist')).rejects.toThrowError();
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

      const shouldBeUndefined = await usersService.changePassword(
        id,
        changePasswordDto,
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
        usersService.changePassword(id, changePasswordDto),
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

      const updatedUser = await usersService.changeEmail(id, changeEmailDto);

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
        usersService.changeEmail(id, changeEmailDto),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await redisService.quit();
      await prismaService.$transaction([
        prismaService.users.deleteMany({
          where: {
            user_id: 'test123',
          },
        }),
      ]);
    });
  });
});
