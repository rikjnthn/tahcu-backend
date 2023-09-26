import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaKnownRequestErrorFilter } from 'src/common/filter/prisma-known-request-error.filter';
import { UserType } from './interface/user.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/common/decorator/user.decorator';

@Controller('users')
@UseFilters(PrismaKnownRequestErrorFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserType> {
    return await this.usersService.create(createUserDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async find(@Param('id') id: string): Promise<UserType[]> {
    return await this.usersService.find(id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  async update(
    @User('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserType> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  async remove(@User('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
