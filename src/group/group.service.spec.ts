import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';

import { GroupService } from './group.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

describe('GroupService', () => {
  describe('Unit Testing', () => {
    let prismaService: PrismaService;
    let groupService: GroupService;

    const user_1 = 'user_1';
    const user_2 = 'user_2';
    const user_3 = 'user_3';

    const group_id = 'group_id';

    beforeAll(async () => {
      prismaService = new PrismaService();
      groupService = new GroupService(prismaService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(groupService).toBeDefined();
    });

    it('should create group and return record', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: [user_1, user_2],
      };

      const createdGroupMock = {
        id: 'group_id',
        name: 'group_name',
        description: 'group_description',
        created_at: new Date(),
        admin_id: user_1,
        created_by_id: user_1,
        group_membership: [
          {
            id: 'membership_id_1',
            user: {
              username: 'username_1',
            },
            user_id: user_1,
            group_id,
            joined_at: new Date(),
          },
          {
            id: 'membership_id_2',
            user: {
              username: 'username_2',
            },
            user_id: user_2,
            group_id,
            joined_at: new Date(),
          },
        ],
      };

      jest.spyOn(groupService, 'create').mockResolvedValue(createdGroupMock);

      const createdGroup = await groupService.create(createGroupDto, user_1);

      expect(groupService.create).toBeCalled();
      expect(groupService.create).toBeCalledWith(createGroupDto, user_1);

      expect(createdGroup).toEqual(createdGroupMock);
    });

    it('should return exception if user that create group not exist', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: [user_1, user_2],
      };
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'The users to add to the group was not found',
        },
      });

      jest.spyOn(groupService, 'create').mockRejectedValue(error);

      await expect(
        groupService.create(createGroupDto, 'not_exist_user_id'),
      ).rejects.toThrow(error);
    });

    it('should add(create) group membership and return record', async () => {
      const addMmeberDto = {
        group_id: 'group_id',
        members: [user_3],
      };

      const addedMemberMock = [
        {
          id: 'membership_id_1',
          user: {
            username: 'username_1',
          },
          user_id: user_1,
          group_id,
          joined_at: new Date(),
        },
        {
          id: 'membership_id_2',
          user: {
            username: 'username_2',
          },
          user_id: user_2,
          group_id,
          joined_at: new Date(),
        },
        {
          id: 'membership_id_3',
          user_id: user_3,
          group_id: '1',
          joined_at: new Date(),
        },
      ];

      jest.spyOn(groupService, 'addMembers').mockResolvedValue(addedMemberMock);

      const addedMember = await groupService.addMembers(addMmeberDto, user_1);

      expect(groupService.addMembers).toBeCalled();
      expect(groupService.addMembers).toBeCalledWith(addMmeberDto, user_1);

      expect(addedMember).toEqual(addedMemberMock);
    });

    it('should return exception if user that need to be add to a group not exist', async () => {
      const addMemberDto = {
        group_id: '1',
        members: ['not_exist_user_id'],
      };

      const error = new BadRequestException({
        err: {
          code: 'NOT_FOUND',
          message: 'The members to add to the group were not found',
        },
      });

      jest.spyOn(groupService, 'addMembers').mockRejectedValue(error);

      await expect(
        groupService.addMembers(addMemberDto, user_1),
      ).rejects.toThrow(error);
    });

    it('should return exception if a group not exist when adding member', async () => {
      const addMemberDto = {
        group_id: 'not_exist_group_id',
        members: ['user_4'],
      };

      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group was not found',
        },
      });

      jest.spyOn(groupService, 'addMembers').mockRejectedValue(error);

      const differentGroupAdmin = 'user_5';

      await expect(
        groupService.addMembers(addMemberDto, differentGroupAdmin),
      ).rejects.toThrow(error);
    });

    it('should return exception if a non admin adding member', async () => {
      const addMemberDto = {
        group_id: 'group_id',
        members: ['user_4'],
      };

      const error = new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'You were not permitted to edit members in this group',
        },
      });

      jest.spyOn(groupService, 'addMembers').mockRejectedValue(error);

      await expect(
        groupService.addMembers(addMemberDto, 'not_admin_user_id'),
      ).rejects.toThrow(error);
    });

    it('should find group', async () => {
      const foundGroupMock = {
        id: 'group_id',
        name: 'group_name',
        description: 'group_description',
        created_at: new Date(),
        admin_id: user_1,
        created_by_id: user_1,
        group_membership: [
          {
            id: 'membership_id_1',
            user: {
              username: 'username_1',
            },
            user_id: user_1,
            group_id,
            joined_at: new Date(),
          },
          {
            id: 'membership_id_2',
            user: {
              username: 'username_2',
            },
            user_id: user_2,
            group_id,
            joined_at: new Date(),
          },
          {
            id: 'membership_id_3',
            user: {
              username: 'username_3',
            },
            user_id: user_3,
            group_id,
            joined_at: new Date(),
          },
        ],
      };

      jest.spyOn(groupService, 'findOne').mockResolvedValue(foundGroupMock);

      const group = await groupService.findOne('group_id');

      expect(groupService.findOne).toBeCalled();
      expect(groupService.findOne).toBeCalledWith('group_id');

      expect(group).toEqual(foundGroupMock);
    });

    it('should return exception if group is not found', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group was not found',
        },
      });

      jest.spyOn(groupService, 'findOne').mockRejectedValue(error);

      await expect(groupService.findOne('not_exist_group_id')).rejects.toThrow(
        error,
      );
    });

    it('should find groups', async () => {
      const foundGroupMock = [
        {
          id: 'group_id',
          name: 'group_name',
          description: 'group_description',
          created_at: new Date(),
          admin_id: user_1,
          created_by_id: user_1,
          group_membership: [
            {
              id: 'membership_id_1',
              user: {
                username: 'username_1',
              },
              user_id: user_1,
              group_id,
              joined_at: new Date(),
            },
            {
              id: 'membership_id_2',
              user: {
                username: 'username_2',
              },
              user_id: user_2,
              group_id,
              joined_at: new Date(),
            },
            {
              id: 'membership_id_3',
              user: {
                username: 'username_3',
              },
              user_id: user_3,
              group_id,
              joined_at: new Date(),
            },
          ],
        },
      ];

      jest.spyOn(groupService, 'findAll').mockResolvedValue(foundGroupMock);

      const createdGroup = await groupService.findAll(user_1, 0);

      expect(groupService.findAll).toBeCalled();
      expect(groupService.findAll).toBeCalledWith(user_1, 0);

      expect(createdGroup).toEqual(foundGroupMock);
    });

    it('should return empty array if user not joined any group', async () => {
      jest.spyOn(groupService, 'findAll').mockResolvedValue([]);

      await expect(groupService.findAll('no_group_user', 0)).resolves.toEqual(
        [],
      );
    });

    it('should update group and return record', async () => {
      const updateGroupDto = {
        description: 'change description',
        name: 'change group name',
        new_admin: user_2,
      };

      const updatedGroupMock = {
        id: 'group_id',
        name: 'change group name',
        description: 'change description',
        created_at: new Date(),
        admin_id: user_2,
        created_by_id: user_1,
      };
      jest
        .spyOn(groupService, 'updateGroup')
        .mockResolvedValue(updatedGroupMock);

      const updatedGroup = await groupService.updateGroup(
        'group_id',
        updateGroupDto,
        user_1,
      );

      expect(groupService.updateGroup).toBeCalled();
      expect(groupService.updateGroup).toBeCalledWith(
        'group_id',
        updateGroupDto,
        'user_1',
      );

      expect(updatedGroup).toEqual(updatedGroupMock);
    });

    it('should return exception if group admin changed to non exist user', async () => {
      const updateGroupDto = {
        description: 'change description again',
        name: 'change group name again',
        new_admin: 'not_exist_user_id',
      };

      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Admin id was not found',
        },
      });

      jest.spyOn(groupService, 'updateGroup').mockRejectedValue(error);

      await expect(
        groupService.updateGroup('group_id', updateGroupDto, user_1),
      ).rejects.toThrow(error);
    });

    it('should return exception if non admin trying to update group', async () => {
      const updateGroupDto = {
        description: 'change description again',
        name: 'change group name again',
        new_admin: user_3,
      };

      const error = new UnauthorizedException({
        error: {
          code: 'NOT_FOUND',
          message: 'You were not permitted to edit this group',
        },
      });

      jest.spyOn(groupService, 'updateGroup').mockRejectedValue(error);

      await expect(
        groupService.updateGroup(
          'group_id',
          updateGroupDto,
          'not_group_admin_id',
        ),
      ).rejects.toThrow(error);
    });

    it('should return exception if group not found when update group', async () => {
      const updateGroupDto = {
        description: 'change group description again',
        name: 'change group name again',
        new_admin: user_3,
      };

      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group was not found',
        },
      });

      jest.spyOn(groupService, 'updateGroup').mockRejectedValue(error);

      await expect(
        groupService.updateGroup('not_exist_group_id', updateGroupDto, user_2),
      ).rejects.toThrow(error);
    });

    it('should delete group', async () => {
      jest.spyOn(groupService, 'remove').mockResolvedValue(undefined);

      const updatedGroup = await groupService.remove('group_id', user_2);

      expect(groupService.remove).toBeCalled();
      expect(groupService.remove).toBeCalledWith('group_id', user_2);

      expect(updatedGroup).toBeUndefined();
    });

    it('should return exception if non admin trying to delete group', async () => {
      jest
        .spyOn(groupService, 'remove')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        groupService.remove('group_id', 'not_admin_id'),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should return exception if group not found when trying to delete group', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group was not found',
        },
      });

      jest.spyOn(groupService, 'remove').mockRejectedValue(error);

      await expect(
        groupService.remove('not_exist_group_id', user_2),
      ).rejects.toThrowError(error);
    });

    it('should delete group member', async () => {
      const deleteMemberDto = {
        group_id: 'group_id',
        members: [user_3],
      };

      const deletedMemberMock = [
        {
          id: 'membership_id_1',
          user_id: user_1,
          group_id: 'group_id',
          joined_at: new Date(),
        },
        {
          id: 'membership_id_2',
          user_id: user_2,
          group_id: 'group_id',
          joined_at: new Date(),
        },
      ];

      jest
        .spyOn(groupService, 'deleteMembers')
        .mockResolvedValue(deletedMemberMock);

      const updatedGroup = await groupService.deleteMembers(
        deleteMemberDto,
        user_2,
      );

      expect(groupService.deleteMembers).toBeCalled();
      expect(groupService.deleteMembers).toBeCalledWith(
        deleteMemberDto,
        user_2,
      );

      expect(updatedGroup).toEqual(deletedMemberMock);
    });

    it('should return exception non admin trying to delete group member', async () => {
      const deleteMemberDto = {
        group_id: 'group_id',
        members: [user_1],
      };

      const error = new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'You were not permitted to edit member this group',
        },
      });

      jest.spyOn(groupService, 'deleteMembers').mockRejectedValue(error);

      await expect(
        groupService.deleteMembers(deleteMemberDto, 'not_admin_id'),
      ).rejects.toThrow(error);
    });

    it('should exit from group', async () => {
      jest.spyOn(groupService, 'exitGroup').mockResolvedValue(undefined);

      const exitGroup = await groupService.exitGroup(
        'group_id',
        user_1,
        user_2,
      );

      expect(groupService.exitGroup).toBeCalled();
      expect(groupService.exitGroup).toBeCalledWith('group_id', user_1, user_2);

      expect(exitGroup).toBeUndefined();
    });

    it('should return exception if group not found when trying to exit from group', async () => {
      const error = new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'Group does not found',
        },
      });

      jest.spyOn(groupService, 'exitGroup').mockRejectedValue(error);

      await expect(
        groupService.exitGroup('not_exist_group_id', user_1, user_2),
      ).rejects.toThrow(error);
    });
  });

  describe('Integration Testing', () => {
    let prismaService: PrismaService;
    let groupService: GroupService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          PrismaModule,
          UsersModule,
          JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {
              expiresIn: process.env.JWT_EXPIRED,
            },
          }),
          ThrottlerModule.forRoot([
            {
              ttl: parseInt(process.env.DEFAULT_THROTTLER_TTL),
              limit: parseInt(process.env.DEFAULT_THROTTLER_LIMIT),
            },
          ]),
        ],
        providers: [GroupService],
      }).compile();

      module.close();

      prismaService = module.get(PrismaService);
      groupService = module.get(GroupService);
    });

    beforeEach(async () => {
      await prismaService.users.createMany({
        data: [
          {
            email: 'user_1@gmail.com',
            password: 'password',
            user_id: 'user_id_1',
            username: 'username_1',
          },
          {
            email: 'user_2@gmail.com',
            password: 'password',
            user_id: 'user_id_2',
            username: 'username_2',
          },
          {
            email: 'user_3@gmail.com',
            password: 'password',
            user_id: 'user_id_3',
            username: 'username_3',
          },
        ],
      });
    });

    afterEach(async () => {
      await prismaService.$transaction([
        prismaService.users.deleteMany(),
        prismaService.groupMembership.deleteMany(),
        prismaService.group.deleteMany(),
      ]);
    });

    it('should be defined', () => {
      expect(groupService).toBeDefined();
    });

    it('should create group and return record', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      expect(createdGroup.name).toBe(createGroupDto.name);
      expect(createdGroup.admin_id).toBe('user_id_1');
      expect(createdGroup.created_by_id).toBe('user_id_1');
      expect(createdGroup.description).toBe(createGroupDto.description);

      expect(createdGroup.group_membership[0].user_id).toBe('user_id_1');
      expect(createdGroup.group_membership[1].user_id).toBe('user_id_2');
    });

    it('should return exception if user that create group not exist', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      await expect(
        groupService.create(createGroupDto, 'not_exist_user_id'),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'The users to add to the group was not found',
          },
        }),
      );
    });

    it('should add(create) group membership and return record', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      const addMmeberDto = {
        group_id: createdGroup.id,
        members: ['user_id_3'],
      };

      const addedMembers = await groupService.addMembers(
        addMmeberDto,
        'user_id_1',
      );

      const user_3_membership = addedMembers.find((member) => {
        return member.user_id === 'user_id_3';
      });

      expect(user_3_membership.group_id).toBe(addMmeberDto.group_id);
      expect(user_3_membership.user_id).toBe('user_id_3');
    });

    it('should return exception if user that need to be add to a group not exist', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );
      await expect(
        groupService.addMembers(
          { group_id: createdGroup.id, members: ['not_exist_user_id'] },
          'user_id_1',
        ),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'The user to add to the group was not found',
          },
        }),
      );
    });

    it('should return exception if a group not exist when adding member', async () => {
      const addMmeberDto = {
        group_id: 'not_exist_group_id',
        members: ['user_id_3'],
      };

      await expect(
        groupService.addMembers(addMmeberDto, 'user_id_1'),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'Group was not found',
          },
        }),
      );
    });

    it('should return exception if non admin adding member', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      const addMmeberDto = {
        group_id: createdGroup.id,
        members: ['user_id_3'],
      };

      await expect(
        groupService.addMembers(addMmeberDto, 'not_admin_id'),
      ).rejects.toThrow(
        new UnauthorizedException({
          error: {
            code: 'UNAUTHORIZED',
            message: 'You were not permitted to edit members in this group',
          },
        }),
      );
    });

    it('should find group', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      const group = await groupService.findOne(createdGroup.id);

      expect(group.name).toEqual('group_name');
      expect(group.description).toEqual('group_description');
      expect(group.admin_id).toEqual('user_id_1');
      expect(group.created_by_id).toEqual('user_id_1');
    });

    it('should return exception if group is not found', async () => {
      await expect(groupService.findOne('not_exist_group_id')).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'Group was not found',
          },
        }),
      );
    });

    it('should find groups', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      const [group] = await groupService.findAll('user_id_1', 0);

      expect(group.name).toEqual('group_name');
      expect(group.description).toEqual('group_description');
      expect(group.admin_id).toEqual('user_id_1');
      expect(group.created_by_id).toEqual('user_id_1');

      const members = ['user_id_1', 'user_id_2'];

      group.group_membership.forEach(({ user_id, group_id }, idx) => {
        expect(user_id).toBe(members[idx]);
        expect(group_id).toBe(createdGroup.id);
      });
    });

    it('should return empty array if user not joined any group', async () => {
      await expect(groupService.findAll('user_5', 0)).resolves.toEqual([]);
    });

    it('should update group and return record', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      const updateGroupDto = {
        description: 'new_description',
        name: 'new group name',
        new_admin: 'user_id_2',
      };

      const updatedGroup = await groupService.updateGroup(
        createdGroup.id,
        updateGroupDto,
        'user_id_1',
      );

      expect(updatedGroup.id).toEqual(createdGroup.id);
      expect(updatedGroup.admin_id).toEqual('user_id_2');
      expect(updatedGroup.created_by_id).toEqual('user_id_1');
      expect(updatedGroup.description).toEqual(updateGroupDto.description);
      expect(updatedGroup.name).toEqual(updateGroupDto.name);
    });

    it('should return exception if group admin changed to non exist user', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      const updateGroupDto = {
        description: 'change description',
        name: 'change group name',
        new_admin: 'not_exist_user_id',
      };

      await expect(
        groupService.updateGroup(createdGroup.id, updateGroupDto, 'user_id_1'),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'Admin id was not found',
          },
        }),
      );
    });

    it('should return exception if non admin trying to update group', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      const updateGroupDto = {
        description: 'new description',
        name: 'group name',
      };

      await expect(
        groupService.updateGroup(createdGroup.id, updateGroupDto, 'user_id_2'),
      ).rejects.toThrow(
        new UnauthorizedException({
          error: {
            code: 'NOT_FOUND',
            message: 'You were not permitted to edit this group',
          },
        }),
      );
    });

    it('should return exception if group not found when update group', async () => {
      const updateGroupDto = {
        description: 'desc',
        name: 'new group name 2',
        new_admin: 'user_id_3',
      };

      await expect(
        groupService.updateGroup(
          'not_exist_group_id',
          updateGroupDto,
          'user_id_1',
        ),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'Group was not found',
          },
        }),
      );
    });

    it('should return exception if non admin trying to delete group', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      await expect(
        groupService.remove(createdGroup.id, 'user_id_2'),
      ).rejects.toThrowError();
    });

    it('should delete group member', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2', 'user_id_3'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      const deleteMemberDto = {
        group_id: createdGroup.id,
        members: ['user_id_3'],
      };

      const updatedGroup = await groupService.deleteMembers(
        deleteMemberDto,
        'user_id_1',
      );

      const members = ['user_id_1', 'user_id_2'];

      updatedGroup.forEach(({ group_id, user_id }, idx) => {
        expect(group_id).toBe(group_id);
        expect(user_id).toBe(members[idx]);
      });
    });

    it('should return exception when non admin trying to delete group member', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      const deleteMemberDto = {
        group_id: createdGroup.id,
        members: ['user_id_1'],
      };

      await expect(
        groupService.deleteMembers(deleteMemberDto, 'user_id_2'),
      ).rejects.toThrow(
        new UnauthorizedException({
          error: {
            code: 'NOT_FOUND',
            message: 'You were not permitted to edit this group',
          },
        }),
      );
    });

    it('should exit from group', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      await expect(
        groupService.exitGroup(createdGroup.id, 'user_id_2', 'user_id_1'),
      ).resolves.toBeUndefined();

      await expect(
        prismaService.groupMembership.findFirst({
          where: { group_id: createdGroup.id, user_id: 'user_id_1' },
        }),
      ).resolves.toBeNull();
    });

    it('should return exception if group not found when trying to exit from group', async () => {
      await expect(
        groupService.exitGroup('not_exist_group_id', 'user_id_1', 'user_id_2'),
      ).rejects.toThrow(
        new BadRequestException({
          error: {
            code: 'NOT_FOUND',
            message: 'Group does not found',
          },
        }),
      );
    });

    it('should delete group', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: ['user_id_1', 'user_id_2'],
      };

      const createdGroup = await groupService.create(
        createGroupDto,
        'user_id_1',
      );

      await expect(
        groupService.remove(createdGroup.id, 'user_id_1'),
      ).resolves.toBeUndefined();

      await expect(
        prismaService.group.findFirst({
          where: { id: createdGroup.id },
        }),
      ).resolves.toBeNull();
    });

    it('should return exception if group not found when trying to delete group', async () => {
      await expect(
        groupService.remove('not_exist_group_id', 'user_id_1'),
      ).rejects.toThrowError();
    });

    afterAll(async () => {
      await prismaService.$transaction([
        prismaService.group.deleteMany(),
        prismaService.users.deleteMany(),
      ]);
    });
  });
});
