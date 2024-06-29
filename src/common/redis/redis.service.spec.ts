import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  describe('Unit Testing', () => {
    let redisService: RedisService;

    beforeAll(() => {
      redisService = new RedisService();
    });

    it('should be defined', () => {
      expect(redisService).toBeDefined();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });

  describe('Integration Testing', () => {
    let redisService: RedisService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [RedisService],
      }).compile();

      redisService = module.get<RedisService>(RedisService);
    });

    it('should be defined', () => {
      expect(redisService).toBeDefined();
    });

    afterAll(async () => {
      await redisService.quit();
    });
  });
});
