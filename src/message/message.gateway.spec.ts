import { MessageService } from './message.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { MessageGateway } from './message.gateway';

describe('MessageGateway', () => {
  describe('Unit Testing', () => {
    let messageService: MessageService;
    let messageGateway: MessageGateway;
    let prismaService: PrismaService;

    beforeAll(() => {
      prismaService = new PrismaService();
      messageService = new MessageService(prismaService);
      messageGateway = new MessageGateway(messageService);
    });

    it('should be defined', () => {
      expect(messageGateway).toBeDefined();
    });
  });
});
