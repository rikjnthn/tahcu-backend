import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaKnownRequestErrorFilter } from 'src/common/filter/prisma-known-request-error.filter';
import { UserType } from './interface/user.interface';

@Controller('users')
@UseFilters(PrismaKnownRequestErrorFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/sign-up')
  async create(@Body() createUserDto: CreateUserDto): Promise<UserType> {
    return await this.usersService.create(createUserDto);
  }

  @Get(':id')
  async find(@Param('id') id: string): Promise<UserType[]> {
    return await this.usersService.find(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserType> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
