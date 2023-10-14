import { Test, TestingModule } from '@nestjs/testing';
import { GroupMessageGateway } from './group-message.gateway';
import { GroupMessageService } from './group-message.service';

describe('GroupMessageGateway', () => {
  let gateway: GroupMessageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupMessageGateway, GroupMessageService],
    }).compile();

    gateway = module.get<GroupMessageGateway>(GroupMessageGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
