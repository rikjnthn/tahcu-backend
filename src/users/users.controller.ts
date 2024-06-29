import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Param,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from './interface/user.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/common/decorator/user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';

const twelveHoursInMs = 43200000;
const oneSecondInMs = 1000;

@Controller('users')
@UseGuards(AuthGuard, ThrottlerGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Throttle({ default: { limit: 10, ttl: oneSecondInMs } })
  async findOne(@User('id') id: string): Promise<UserType> {
    return await this.usersService.findOne(id);
  }

  @Get(':userId')
  @Throttle({ default: { limit: 10, ttl: oneSecondInMs } })
  async find(@Param('userId') userId: string): Promise<UserType[]> {
    return await this.usersService.find(userId);
  }

  @Patch()
  async update(
    @User('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserType> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete()
  async remove(@User('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }

  @Patch('change-password')
  @Throttle({ default: { limit: 3, ttl: twelveHoursInMs } })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User('id') id: string,
  ): Promise<void> {
    await this.usersService.changePassword(id, changePasswordDto);
  }

  @Patch('change-email')
  @Throttle({ default: { limit: 3, ttl: twelveHoursInMs } })
  async changeEmail(
    @Body() changeEmailDto: ChangeEmailDto,
    @User('id') id: string,
  ): Promise<UserType> {
    return await this.usersService.changeEmail(id, changeEmailDto);
  }
}
