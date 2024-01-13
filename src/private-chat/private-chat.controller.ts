import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrivateChatService } from './private-chat.service';
import { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import { UpdatePrivateChatDto } from './dto/update-private-chat.dto';
import { PrismaKnownRequestErrorFilter } from 'src/common/filter/prisma-known-request-error.filter';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChatType } from './interface/private-chat.interface';

@Controller('private-chat')
@UseFilters(PrismaKnownRequestErrorFilter)
@UseGuards(AuthGuard)
export class PrivateChatController {
  constructor(private readonly privateChatService: PrivateChatService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPrivateChatDto: CreatePrivateChatDto,
  ): Promise<ChatType> {
    return await this.privateChatService.create(createPrivateChatDto);
  }

  @Get()
  @HttpCode(HttpStatus.FOUND)
  async findAll(@Req() request: Request): Promise<ChatType[]> {
    return await this.privateChatService.findAll(request);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePrivateChatDto: UpdatePrivateChatDto,
  ): Promise<ChatType> {
    return await this.privateChatService.update(id, updatePrivateChatDto);
  }

  @Delete()
  async remove(@Body('id') id: string[]): Promise<void> {
    return await this.privateChatService.remove(id);
  }
}
