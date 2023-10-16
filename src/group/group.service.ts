import { Injectable, UnauthorizedException } from '@nestjs/common';

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
          admin_id: userId,
          created_by_id: userId,
          group_membership: {
            createMany: {
              data: members.map((member) => ({ user_id: member })),
            },
          },
        },
        include: { group_membership: true },
      }),
    ]);

    return createdGroup;
  }

  async findAll() {
    const groups = await this.prismaService.group.findMany({
      include: { group_membership: true },
    });
    return groups;
  }

  async updateGroup(groupId: string, updateGroupDto: UpdateGroupDto) {
    const { description, name, new_admin } = updateGroupDto;

    const updatedGroup = await this.prismaService.$transaction([
      this.prismaService.group.update({
        where: { id: groupId },
        data: {
          description,
          name,
          admin_id: new_admin,
        },
      }),
    ]);

    return updatedGroup;
  }

  async addMembers(addMemberDto: AddMemberDto, user_id: string) {
    const { group_id, members } = addMemberDto;

    const { admin_id } = await this.prismaService.group.findFirst({
      where: { id: group_id },
    });

    if (admin_id !== user_id)
      throw new UnauthorizedException(
        'You were not permitted to add member this group',
      );

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

  async deleteMembers(deleteMemberDto: DeleteMemberDto, user_id: string) {
    const { group_id, memberships } = deleteMemberDto;

    const { admin_id } = await this.prismaService.group.findFirst({
      where: { id: group_id },
    });

    if (admin_id !== user_id)
      throw new UnauthorizedException(
        'You were not permitted to add member this group',
      );

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

  async exitGroup(group_id: string, user_id: string) {
    await this.prismaService.groupMembership.delete({
      where: {
        user_id_group_id: {
          group_id,
          user_id,
        },
      },
    });
  }

  async remove(groupId: string, user_id: string) {
    const { admin_id } = await this.prismaService.group.findFirst({
      where: {
        id: groupId,
      },
    });

    if (admin_id !== user_id)
      throw new UnauthorizedException(
        'You were not permitted to delete this group',
      );

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
