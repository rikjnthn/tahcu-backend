import { Test, TestingModule } from '@nestjs/testing';

import { OtpService } from './otp.service';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '../redis/redis.module';

describe('OtpService', () => {
  describe('Unit Testing', () => {
    let redisService: RedisService;
    let otpService: OtpService;

    beforeAll(() => {
      redisService = new RedisService();
      otpService = new OtpService(redisService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(otpService).toBeDefined();
    });

    it('should generate otp and stored it', async () => {
      jest.spyOn(otpService, 'generateOtp').mockResolvedValue('1234');

      const otp = await otpService.generateOtp('email@gmail.com');

      expect(otp).toEqual('1234');
    });

    it('should return void if otp is valid', async () => {
      jest.spyOn(otpService, 'validateOtp').mockResolvedValue(undefined);

      const isOtpValid = await otpService.validateOtp(
        '1234',
        'email@gmail.com',
      );

      expect(isOtpValid).toBeUndefined();
    });

    it('should throw error if otp is not valid', async () => {
      jest.spyOn(otpService, 'validateOtp').mockRejectedValue(new Error());

      const notValidOtp = '1029';

      await expect(
        otpService.validateOtp(notValidOtp, 'email@gmail.com'),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });

  describe('Integration Testing', () => {
    let redisService: RedisService;
    let otpService: OtpService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [RedisModule],
        providers: [OtpService],
      }).compile();

      otpService = module.get<OtpService>(OtpService);
      redisService = module.get<RedisService>(RedisService);
    });

    it('should be defined', () => {
      expect(otpService).toBeDefined();
    });

    it('should generate otp and stored it', async () => {
      const otp = await otpService.generateOtp('email@gmail.com');

      const otpFromRedis = await redisService.get('email@gmail.com');

      expect(otp).toEqual(otpFromRedis);

      await redisService.del('email@gmail.com');
    });

    it('should return void if otp is valid', async () => {
      const otp = await otpService.generateOtp('email@gmail.com');

      const isOtpValid = await otpService.validateOtp(otp, 'email@gmail.com');

      expect(isOtpValid).toBeUndefined();
    });

    it('should throw error if otp is not valid', async () => {
      const notValidOtp = '1092';

      await expect(
        otpService.validateOtp(notValidOtp, 'email@gmail.com'),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });
});
