import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { RedisService } from '../redis/redis.service';
import { OtpService } from '../otp/otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OtpModule } from '../otp/otp.module';

describe('EmailService', () => {
  describe('Unit Testing', () => {
    let prismaService: PrismaService;
    let redisService: RedisService;
    let otpService: OtpService;
    let emailService: EmailService;

    beforeAll(() => {
      prismaService = new PrismaService();
      redisService = new RedisService();
      otpService = new OtpService(redisService);
      emailService = new EmailService(prismaService, otpService);
    });

    it('should be defined', () => {
      expect(emailService).toBeDefined();
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

    it('should be defined', () => {
      expect(emailService).toBeDefined();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });
});
