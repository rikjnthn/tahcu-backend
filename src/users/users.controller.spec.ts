import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController Unit Test', () => {
  let usersController: UsersController;

  const userServiceMock = {
    create: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const createUserDtoStub: CreateUserDto = {
    user_id: 'tes123',
    email: 'tes@gmail.com',
    is_active: true,
    password: 'tes123',
    username: 'test',
  };

  const createdUserMock = {
    id: '1',
    user_id: 'tes123',
    email: 'tes@gmail.com',
    is_active: true,
    password: 'tes123',
    username: 'test',
    created_at: new Date(),
    updated_at: new Date(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });
});
