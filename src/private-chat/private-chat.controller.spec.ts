import { Test, TestingModule } from '@nestjs/testing';
import { PrivateChatController } from './private-chat.controller';
import { PrivateChatService } from './private-chat.service';

describe('PrivateChatController', () => {
  let controller: PrivateChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivateChatController],
      providers: [PrivateChatService],
    }).compile();

    controller = module.get<PrivateChatController>(PrivateChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
