import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  seconds,
  SkipThrottle,
  Throttle,
  ThrottlerGuard,
} from '@nestjs/throttler';

import { PrivateChatService } from './private-chat.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContactType } from './interface/private-chat.interface';
import { User } from 'src/common/decorator/user.decorator';

@Controller('private-chat')
@UseGuards(AuthGuard, ThrottlerGuard)
@Throttle({ default: { ttl: seconds(1), limit: 60 } })
export class PrivateChatController {
  constructor(private privateChatService: PrivateChatService) {}

  @Post(':friendId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('friendId') friendId: string,
    @User('user_id') userId: string,
  ): Promise<ContactType> {
    return await this.privateChatService.create(friendId, userId);
  }

  @Get()
  async findAll(@User('user_id') userId: string): Promise<ContactType[]> {
    return await this.privateChatService.findAll(userId);
  }

  @Delete(':id')
  @SkipThrottle()
  async remove(@Param('id') id: string): Promise<void> {
    return await this.privateChatService.remove(id);
  }
}
