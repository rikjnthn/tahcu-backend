import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { seconds, Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User } from 'src/common/decorator/user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';
import {
  GroupType,
  GroupWithMemberShipType,
  MemberType,
} from './interface/group.interface';

@Controller('group')
@UseGuards(AuthGuard, ThrottlerGuard)
@Throttle({ default: { ttl: seconds(1), limit: 60 } })
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @User('user_id') userId: string,
  ): Promise<GroupWithMemberShipType> {
    return await this.groupService.create(createGroupDto, userId);
  }

  @Get(':groupId')
  async findOne(@Param('groupId') groupId): Promise<GroupWithMemberShipType> {
    return await this.groupService.findOne(groupId);
  }

  @Get()
  async findAll(
    @User('user_id') userId: string,
  ): Promise<GroupWithMemberShipType[]> {
    return await this.groupService.findAll(userId);
  }

  @Patch('update-group/:groupId')
  async updateGroup(
    @Param('groupId') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @User('user_id') userId: string,
  ): Promise<GroupType> {
    return await this.groupService.updateGroup(groupId, updateGroupDto, userId);
  }

  @Patch('add-members')
  async addMembers(
    @Body() addMemberDto: AddMemberDto,
    @User('user_id') userId: string,
  ): Promise<MemberType[]> {
    return await this.groupService.addMembers(addMemberDto, userId);
  }

  @Patch('delete-members')
  async deleteMembers(
    @Body() deleteMemberDto: DeleteMemberDto,
    @User('user_id') userId: string,
  ): Promise<MemberType[]> {
    return await this.groupService.deleteMembers(deleteMemberDto, userId);
  }

  @Patch('exit-group/:groupId')
  async exitGroup(
    @Param('groupId') groupId: string,
    @Body('new_admin') newAdmin: string,
    @User('user_id') userId: string,
  ): Promise<void> {
    await this.groupService.exitGroup(groupId, newAdmin, userId);
  }

  @Delete(':groupId')
  async remove(
    @Param('groupId') groupId: string,
    @User('user_id') userId: string,
  ): Promise<void> {
    await this.groupService.remove(groupId, userId);
  }
}
