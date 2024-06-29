import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  describe('Unit Testing', () => {
    let prismaService: PrismaService;

    beforeAll(() => {
      prismaService = new PrismaService();
    });

    it('should be defined', () => {
      expect(prismaService).toBeDefined();
    });
  });

  describe('Integration Testing', () => {
    let prismaService: PrismaService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
      expect(prismaService).toBeDefined();
    });
  });
});
