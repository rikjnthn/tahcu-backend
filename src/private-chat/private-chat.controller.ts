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
} from '@nestjs/common';
import { PrivateChatService } from './private-chat.service';
import { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import { UpdatePrivateChatDto } from './dto/update-private-chat.dto';
import { PrismaKnownRequestErrorFilter } from 'src/common/filter/prisma-known-request-error.filter';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('private-chat')
@UseFilters(PrismaKnownRequestErrorFilter)
@UseGuards(AuthGuard)
export class PrivateChatController {
  constructor(private readonly privateChatService: PrivateChatService) {}

  @Post()
  async create(@Body() createPrivateChatDto: CreatePrivateChatDto) {
    return await this.privateChatService.create(createPrivateChatDto);
  }

  @Get()
  async findAll(@Req() request: Request) {
    return await this.privateChatService.findAll(request);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePrivateChatDto: UpdatePrivateChatDto,
  ) {
    return await this.privateChatService.update(id, updatePrivateChatDto);
  }

  @Delete()
  async remove(@Body('id') id: string[]) {
    return await this.privateChatService.remove(id);
  }
}
