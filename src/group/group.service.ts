import { Injectable } from '@nestjs/common';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';

@Injectable()
export class GroupService {
  constructor(private prismaService: PrismaService) {}

  async create(createGroupDto: CreateGroupDto, userId: string) {
    const { description, name, members } = createGroupDto;

    const [createdGroup] = await this.prismaService.$transaction([
      this.prismaService.group.create({
        data: {
          description,
          name,
          created_by_id: userId,
          group_membership: {
            createMany: {
              data: members.map((member) => ({ user_id: member })),
            },
          },
        },
        include: {
          group_membership: true,
        },
      }),
    ]);

    return createdGroup;
  }

  async findAll() {
    const groups = await this.prismaService.group.findMany({
      include: {
        group_membership: true,
      },
    });
    return groups;
  }

  async updateGroup(groupId: string, updateGroupDto: UpdateGroupDto) {
    const { description, name } = updateGroupDto;

    const updatedGroup = await this.prismaService.$transaction([
      this.prismaService.group.update({
        where: { id: groupId },
        data: {
          description,
          name,
        },
      }),
    ]);

    return updatedGroup;
  }

  async addMembers(addMemberDto: AddMemberDto) {
    const { group_id, members } = addMemberDto;
    const updatedMember = await this.prismaService.$transaction(
      members.map((member) =>
        this.prismaService.groupMembership.create({
          data: {
            group_id,
            user_id: member,
          },
        }),
      ),
    );

    return updatedMember;
  }

  async deleteMembers(deleteMemberDto: DeleteMemberDto) {
    const { group_id, memberships } = deleteMemberDto;

    const updatedMember = await this.prismaService.$transaction(
      memberships.map((membership) =>
        this.prismaService.groupMembership.delete({
          where: {
            group_id,
            id: membership,
          },
        }),
      ),
    );

    return updatedMember;
  }

  async remove(groupId: string) {
    await this.prismaService.$transaction([
      this.prismaService.groupMembership.deleteMany({
        where: { group_id: groupId },
      }),
      this.prismaService.group.deleteMany({
        where: { id: groupId },
      }),
    ]);
  }
}
