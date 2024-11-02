import { Test, TestingModule } from '@nestjs/testing';
import { createTransport } from 'nodemailer';

import { EmailService } from './email.service';
import { RedisService } from '../redis/redis.service';
import { OtpService } from '../otp/otp.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OtpModule } from '../otp/otp.module';

jest.mock('handlebars', () => {
  return {
    __esModule: true,
    default: {
      compile: jest.fn().mockReturnValue(jest.fn()),
    },
  };
});

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn(),
  };
});

describe('EmailService', () => {
  describe('Unit Testing', () => {
    let redisService: RedisService;
    let otpService: OtpService;
    let emailService: EmailService;

    beforeAll(() => {
      redisService = new RedisService();
      otpService = new OtpService(redisService);
      emailService = new EmailService(otpService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(emailService).toBeDefined();
    });

    it('should send email and return void', async () => {
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue(undefined);

      await expect(
        emailService.sendEmail('email@email.com'),
      ).resolves.toBeUndefined();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });

  describe('Integration Testing', () => {
    let redisService: RedisService;
    let emailService: EmailService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [PrismaModule, OtpModule],
        providers: [EmailService],
      }).compile();

      emailService = module.get<EmailService>(EmailService);
      redisService = module.get<RedisService>(RedisService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(emailService).toBeDefined();
    });

    it('should send email and return void', async () => {
      (createTransport as jest.Mock).mockReturnValue({ sendMail: jest.fn() });

      await expect(
        emailService.sendEmail('email@email.com'),
      ).resolves.toBeUndefined();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });
});
