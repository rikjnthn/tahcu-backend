import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  UseFilters,
} from '@nestjs/common';

import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User } from 'src/common/decorator/User.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaKnownRequestErrorFilter } from 'src/common/filter/prisma-known-request-error.filter';
import { AddMemberDto } from './dto/add-member.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';

@Controller('group')
@UseGuards(AuthGuard)
@UseFilters(PrismaKnownRequestErrorFilter)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @User('id') userId: string,
  ) {
    return await this.groupService.create(createGroupDto, userId);
  }

  @Get()
  async findAll(@User('id') userId: string) {
    return await this.groupService.findAll(userId);
  }

  @Patch('create-group')
  async updateGroup(
    @Body('id') id: string,
    @Body('data') updateGroupDto: UpdateGroupDto,
    @User('id') userId: string,
  ) {
    return await this.groupService.updateGroup(id, updateGroupDto, userId);
  }

  @Patch('add-members')
  async addMembers(
    @Body() addMemberDto: AddMemberDto,
    @User('id') userId: string,
  ) {
    return await this.groupService.addMembers(addMemberDto, userId);
  }

  @Delete('delete-member')
  async deleteMembers(
    @Body() deleteMemberDto: DeleteMemberDto,
    @User('id') userId: string,
  ) {
    return await this.groupService.deleteMembers(deleteMemberDto, userId);
  }

  @Delete('exit-group')
  async exitGroup(@Body('id') groupId: string, @User('id') userId: string) {
    await this.groupService.exitGroup(groupId, userId);
  }

  @Delete()
  async remove(@Body('id') groupId: string, @User('id') userId: string) {
    return await this.groupService.remove(groupId, userId);
  }
}
