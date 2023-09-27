import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaKnownRequestErrorFilter } from 'src/common/filter/prisma-known-request-error.filter';
import { UserType } from './interface/user.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/common/decorator/user.decorator';

@Controller('users')
@UseGuards(AuthGuard)
@UseFilters(PrismaKnownRequestErrorFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async find(@Param('id') id: string): Promise<UserType[]> {
    return await this.usersService.find(id);
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
}
