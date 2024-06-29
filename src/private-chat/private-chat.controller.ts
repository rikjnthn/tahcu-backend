import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { PrivateChatService } from './private-chat.service';
import { UpdatePrivateChatDto } from './dto/update-private-chat.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContactType } from './interface/private-chat.interface';
import { User } from 'src/common/decorator/user.decorator';

const oneSecondInMs = 1000;

@Controller('private-chat')
@UseGuards(AuthGuard, ThrottlerGuard)
@Throttle({ default: { ttl: oneSecondInMs, limit: 60 } })
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

  /**
   *
   * WARNING !!!
   *
   * Please, do not use this function first! It's need more
   * further evaluation. :)
   */
  // @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePrivateChatDto: UpdatePrivateChatDto,
  ): Promise<ContactType> {
    return await this.privateChatService.update(id, updatePrivateChatDto);
  }

  @Delete(':id')
  @SkipThrottle()
  async remove(@Param('id') id: string): Promise<void> {
    return await this.privateChatService.remove(id);
  }
}
