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
  create(@Body() createPrivateChatDto: CreatePrivateChatDto) {
    return this.privateChatService.create(createPrivateChatDto);
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.privateChatService.findAll(request);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrivateChatDto: UpdatePrivateChatDto,
  ) {
    return this.privateChatService.update(id, updatePrivateChatDto);
  }

  @Delete()
  remove(@Body('id') id: string[]) {
    return this.privateChatService.remove(id);
  }
}
