import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';
import {
  GroupType,
  GroupWithMemberShipType,
  MemberType,
} from './interface/group.interface';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(private prismaService: PrismaService) {}

  /**
   * Create group
   *
   * @param createGroupDto dto to create group
   * @param userId as admin id
   *
   * @returns group data
   */
  async create(
    createGroupDto: CreateGroupDto,
    userId: string,
  ): Promise<GroupWithMemberShipType> {
    this.logger.log('Start creating a group');

    const { description, name, members } = createGroupDto;

    try {
      const createdGroup = await this.prismaService.group.create({
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
        include: {
          group_membership: {
            include: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      });

      this.logger.log('Group created');

      return createdGroup;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          this.logger.warn('Members not found');
          throw new BadRequestException({
            error: {
              code: 'NOT_FOUND',
              message: 'The users to add to the group was not found',
            },
          });
        }
      }

      throw error;
    }
  }

  /**
   * Find group
   *
   * @param groupId
   *
   * @returns group data
   */
  async findOne(groupId: string): Promise<GroupWithMemberShipType> {
    this.logger.log('Find group');

    const group = await this.prismaService.group.findFirst({
      where: {
        id: groupId,
      },
      include: {
        group_membership: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      this.logger.warn('Group was not found');

      throw new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group was not found',
        },
      });
    }

    this.logger.log('Group found');

    return group;
  }

  /**
   * Find multiple group with user as a member
   *
   * @param user_id user id
   *
   * @returns array of groups data
   */
  async findAll(
    user_id: string,
    skip: number,
  ): Promise<GroupWithMemberShipType[]> {
    this.logger.log('Find groups');
    const groups = await this.prismaService.group.findMany({
      where: {
        group_membership: { some: { user_id } },
      },
      include: {
        group_membership: {
          include: {
            user: { select: { username: true } },
          },
        },
      },
      skip,
      take: 50,
    });

    return groups;
  }

  /**
   * Update group
   *
   * @param groupId
   * @param updateGroupDto dto to update group
   * @param user_id to verify as group admin
   *
   * @returns updated group data
   */
  async updateGroup(
    groupId: string,
    updateGroupDto: UpdateGroupDto,
    user_id: string,
  ): Promise<GroupType> {
    this.logger.log('Start updating the group');

    const { description, name, new_admin } = updateGroupDto;

    this.logger.log('Find group');
    const group = await this.prismaService.group.findFirst({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      this.logger.warn('Group was not found');

      throw new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group was not found',
        },
      });
    }

    if (group.admin_id !== user_id) {
      this.logger.warn('Not admin');

      throw new UnauthorizedException({
        error: {
          code: 'NOT_FOUND',
          message: 'You were not permitted to edit this group',
        },
      });
    }

    try {
      const updatedGroup = await this.prismaService.group.update({
        where: { id: groupId },
        data: {
          description,
          name,
          admin_id: new_admin,
        },
      });

      this.logger.log('Group updated');

      return updatedGroup;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          this.logger.warn('New admin not found');

          throw new BadRequestException({
            error: {
              code: 'NOT_FOUND',
              message: 'Admin id was not found',
            },
          });
        }
      }

      throw error;
    }
  }

  /**
   * Add multiple members to group
   *
   * @param addMemberDto dto to add multiple members
   * @param user_id to verify as group admin
   *
   * @returns array of group members
   */
  async addMembers(
    addMemberDto: AddMemberDto,
    user_id: string,
  ): Promise<MemberType[]> {
    this.logger.log('Start adding members');

    const { group_id, members } = addMemberDto;

    this.logger.log('Find group');
    const group = await this.prismaService.group.findFirst({
      where: { id: group_id },
    });

    if (!group) {
      this.logger.warn('Group was not found');

      throw new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group was not found',
        },
      });
    }

    if (group.admin_id !== user_id) {
      this.logger.warn('Not admin');

      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'You were not permitted to edit members in this group',
        },
      });
    }

    try {
      await this.prismaService.groupMembership.createMany({
        data: members.map((member) => ({
          group_id,
          user_id: member,
        })),
      });

      const addedMember = await this.prismaService.groupMembership.findMany({
        where: { group_id },
      });

      this.logger.log('Members added');

      return addedMember;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          this.logger.warn('Members not found');
          throw new BadRequestException({
            err: {
              code: 'NOT_FOUND',
              message: 'The members to add to the group were not found',
            },
          });
        }
      }

      throw error;
    }
  }

  /**
   * Delete multiple members from group
   *
   * @param deleteMemberDto dto to delete multiple members from group
   * @param user_id to verify as group admin
   *
   * @returns array of group members
   */
  async deleteMembers(
    deleteMemberDto: DeleteMemberDto,
    user_id: string,
  ): Promise<MemberType[]> {
    this.logger.log('Start delete members');

    const { group_id, members } = deleteMemberDto;

    this.logger.log('Find group');
    const group = await this.prismaService.group.findFirst({
      where: { id: group_id },
    });

    if (!group) {
      this.logger.warn('Group not found');

      throw new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group does not found',
        },
      });
    }

    if (group.admin_id !== user_id) {
      this.logger.warn('Not admin');

      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'You were not permitted to edit member this group',
        },
      });
    }

    await this.prismaService.groupMembership.deleteMany({
      where: {
        group_id,
        user_id: { in: members },
      },
    });

    const updatedMember = await this.prismaService.groupMembership.findMany({
      where: { group_id },
    });

    this.logger.log('Members deleted');

    return updatedMember;
  }

  /**
   * Exit from group and change group admin
   *
   * @param group_id
   * @param new_admin
   * @param user_id
   */
  async exitGroup(
    group_id: string,
    new_admin: string,
    user_id: string,
  ): Promise<void> {
    this.logger.log('Start exiting group');

    this.logger.log('Find group');
    const group = await this.prismaService.group.findFirst({
      where: { id: group_id },
      include: { group_membership: true },
    });

    if (!group) {
      this.logger.warn('Group not found');

      throw new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group does not found',
        },
      });
    }

    if (group.group_membership.length === 0) {
      this.logger.log('Remove the group because it has no member');

      await this.prismaService.group.delete({
        where: { id: group_id },
      });
    }

    try {
      await this.prismaService.$transaction(async (tsx) => {
        if (group.admin_id === user_id) {
          this.logger.log('Change group admin');

          await tsx.group.update({
            where: {
              id: group_id,
            },
            data: {
              admin_id: new_admin,
            },
          });
        }
        this.logger.log('Exit group');

        await tsx.groupMembership.delete({
          where: {
            user_id_group_id: {
              group_id,
              user_id,
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          /*
           * Get the field that cause the problem and remove the '(index)'
           *
           * @example "fk__Table__field (index)" => "field"
           */
          const errorField = (error.meta.field_name as string)
            .split('__')[2]
            .replace(' (index)', '');

          this.logger.warn(`${errorField} not found`);

          throw new BadRequestException({
            error: {
              code: 'NOT_FOUND',
              message: `${errorField} was not found`,
            },
          });
        }

        if (error.code === 'P2025') {
          this.logger.warn('Group membership not found');

          throw new BadRequestException({
            error: {
              code: 'NOT_FOUND',
              message: 'Group membership to delete was not found',
            },
          });
        }
      }

      throw error;
    }
  }

  /**
   * Delete group
   *
   * @param id group id
   * @param user_id to verify as admin
   */
  async remove(id: string, user_id: string): Promise<void> {
    this.logger.log('Start delete group');

    const group = await this.prismaService.group.findFirst({
      where: { id },
    });

    if (!group) {
      this.logger.warn('Group was not found');

      throw new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group was not found',
        },
      });
    }

    if (group.admin_id !== user_id) {
      this.logger.warn('Not admin');

      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'You were not permitted to delete this group',
        },
      });
    }

    try {
      await this.prismaService.group.delete({
        where: { id },
      });

      this.logger.log('Group deleted');
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn('Group not found');
          throw new BadRequestException({
            error: {
              code: 'NOT_FOUND',
              message: 'Group to delete was not found',
            },
          });
        }
      }

      throw error;
    }
  }
}
