import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { GroupService } from './group.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { GroupController } from './group.controller';

describe('GroupController', () => {
  describe('Unit Testing', () => {
    let prismaService: PrismaService;
    let groupService: GroupService;
    let groupController: GroupController;

    const user_1 = 'user_1';
    const user_2 = 'user_2';
    const user_3 = 'user_3';

    const group_id = 'group_id';

    beforeAll(async () => {
      prismaService = new PrismaService();
      groupService = new GroupService(prismaService);
      groupController = new GroupController(groupService);
    });

    it('should be defined', () => {
      expect(groupController).toBeDefined();
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

      jest.spyOn(groupController, 'create').mockResolvedValue(createdGroupMock);

      const createdGroup = await groupController.create(createGroupDto, user_1);

      expect(groupController.create).toBeCalled();
      expect(groupController.create).toBeCalledWith(createGroupDto, user_1);

      expect(createdGroup).toEqual(createdGroupMock);
    });

    it('should return exception if user that create group not exist', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: [user_1, user_2],
      };

      jest.spyOn(groupController, 'create').mockRejectedValue(new Error());

      await expect(
        groupController.create(createGroupDto, 'not_exist_user_id'),
      ).rejects.toThrowError();
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

      jest.spyOn(groupController, 'findOne').mockResolvedValue(foundGroupMock);

      const group = await groupController.findOne('group_id');

      expect(groupController.findOne).toBeCalled();
      expect(groupController.findOne).toBeCalledWith('group_id');

      expect(group).toEqual(foundGroupMock);
    });

    it('should return exception if group is not found', async () => {
      jest.spyOn(groupController, 'findOne').mockRejectedValue(new Error());

      await expect(
        groupController.findOne('not_exist_group_id'),
      ).rejects.toThrowError();
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

      jest
        .spyOn(groupController, 'addMembers')
        .mockResolvedValue(addedMemberMock);

      const addedMember = await groupController.addMembers(
        addMmeberDto,
        user_1,
      );

      expect(groupController.addMembers).toBeCalled();
      expect(groupController.addMembers).toBeCalledWith(addMmeberDto, user_1);

      expect(addedMember).toEqual(addedMemberMock);
    });

    it('should return exception if user that need to be add to a group not exist', async () => {
      const addMemberDto = {
        group_id: '1',
        members: ['not_exist_user_id'],
      };

      jest.spyOn(groupController, 'addMembers').mockRejectedValue(new Error());

      await expect(
        groupController.addMembers(addMemberDto, user_1),
      ).rejects.toThrowError();
    });

    it('should return exception if a group not exist when adding member', async () => {
      const addMemberDto = {
        group_id: 'not_exist_group_id',
        members: ['user_4'],
      };

      jest.spyOn(groupController, 'addMembers').mockRejectedValue(new Error());

      const differentGroupAdmin = 'user_5';

      await expect(
        groupController.addMembers(addMemberDto, differentGroupAdmin),
      ).rejects.toThrowError();
    });

    it('should return exception if a non admin adding member', async () => {
      const addMemberDto = {
        group_id: 'group_id',
        members: ['user_4'],
      };

      jest.spyOn(groupController, 'addMembers').mockRejectedValue(new Error());

      await expect(
        groupController.addMembers(addMemberDto, 'not_admin_user_id'),
      ).rejects.toThrowError();
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

      jest.spyOn(groupController, 'findAll').mockResolvedValue(foundGroupMock);

      const createdGroup = await groupController.findAll(user_1);

      expect(groupController.findAll).toBeCalled();
      expect(groupController.findAll).toBeCalledWith(user_1);

      expect(createdGroup).toEqual(foundGroupMock);
    });

    it('should return empty array if user not joined any group', async () => {
      jest.spyOn(groupController, 'findAll').mockResolvedValue([]);

      await expect(groupController.findAll('no_group_user')).resolves.toEqual(
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
        .spyOn(groupController, 'updateGroup')
        .mockResolvedValue(updatedGroupMock);

      const updatedGroup = await groupController.updateGroup(
        'group_id',
        updateGroupDto,
        user_1,
      );

      expect(groupController.updateGroup).toBeCalled();
      expect(groupController.updateGroup).toBeCalledWith(
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

      jest.spyOn(groupController, 'updateGroup').mockRejectedValue(new Error());

      await expect(
        groupController.updateGroup('group_id', updateGroupDto, user_1),
      ).rejects.toThrowError();
    });

    it('should return exception if non admin trying to update group', async () => {
      const updateGroupDto = {
        description: 'change description again',
        name: 'change group name again',
        new_admin: user_3,
      };

      jest
        .spyOn(groupController, 'updateGroup')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        groupController.updateGroup(
          'group_id',
          updateGroupDto,
          'not_group_admin_id',
        ),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should return exception if group not found when update group', async () => {
      const updateGroupDto = {
        description: 'change group description again',
        name: 'change group name again',
        new_admin: user_3,
      };

      jest.spyOn(groupController, 'updateGroup').mockRejectedValue(new Error());

      await expect(
        groupController.updateGroup(
          'not_exist_group_id',
          updateGroupDto,
          user_2,
        ),
      ).rejects.toThrowError(new Error());
    });

    it('should delete group', async () => {
      jest.spyOn(groupController, 'remove').mockResolvedValue(undefined);

      const updatedGroup = await groupController.remove('group_id', user_2);

      expect(groupController.remove).toBeCalled();
      expect(groupController.remove).toBeCalledWith('group_id', user_2);

      expect(updatedGroup).toBeUndefined();
    });

    it('should return exception if non admin trying to delete group', async () => {
      jest
        .spyOn(groupController, 'remove')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        groupController.remove('group_id', 'not_admin_id'),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should return exception if group not found when trying to delete group', async () => {
      jest
        .spyOn(groupController, 'remove')
        .mockRejectedValue(new NotFoundException());

      await expect(
        groupController.remove('not_exist_group_id', user_2),
      ).rejects.toThrowError(new NotFoundException());
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
        .spyOn(groupController, 'deleteMembers')
        .mockResolvedValue(deletedMemberMock);

      const updatedGroup = await groupController.deleteMembers(
        deleteMemberDto,
        user_2,
      );

      expect(groupController.deleteMembers).toBeCalled();
      expect(groupController.deleteMembers).toBeCalledWith(
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

      jest
        .spyOn(groupController, 'deleteMembers')
        .mockRejectedValue(new UnauthorizedException());

      await expect(
        groupController.deleteMembers(deleteMemberDto, 'not_admin_id'),
      ).rejects.toThrowError(new UnauthorizedException());
    });

    it('should exit from group', async () => {
      jest.spyOn(groupController, 'exitGroup').mockResolvedValue(undefined);

      const exitGroup = await groupController.exitGroup(
        'group_id',
        user_1,
        user_2,
      );

      expect(groupController.exitGroup).toBeCalled();
      expect(groupController.exitGroup).toBeCalledWith(
        'group_id',
        user_1,
        user_2,
      );

      expect(exitGroup).toBeUndefined();
    });

    it('should return exception if group not found when trying to exit from group', async () => {
      jest.spyOn(groupController, 'exitGroup').mockRejectedValue(new Error());

      await expect(
        groupController.exitGroup('not_exist_group_id', user_1, user_2),
      ).rejects.toThrowError();
    });
  });

  describe('Integration Testing', () => {
    let prismaService: PrismaService;
    let groupController: GroupController;

    const user_1 = 'user_1';
    const user_2 = 'user_2';
    const user_3 = 'user_3';

    let group_id: string;

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
        controllers: [GroupController],
      }).compile();

      /**
       * I don't know why I have to use this.
       * If discard this, jest will not exit after running the test.
       */
      module.close();

      prismaService = module.get<PrismaService>(PrismaService);
      groupController = module.get<GroupController>(GroupController);
    });

    beforeAll(async () => {
      await prismaService.users.createMany({
        data: [
          {
            email: 'user_1@gmail.com',
            password: 'password',
            user_id: user_1,
            username: 'username_1',
          },
          {
            email: 'user_2@gmail.com',
            password: 'password',
            user_id: user_2,
            username: 'username_2',
          },
          {
            email: 'user_3@gmail.com',
            password: 'password',
            user_id: user_3,
            username: 'username_3',
          },
        ],
      });
    });

    it('should be defined', () => {
      expect(groupController).toBeDefined();
    });

    it('should create group and return record', async () => {
      const createGroupDto = {
        name: 'group_name',
        description: 'group_description',
        members: [user_1, user_2],
      };

      const createdGroup = await groupController.create(createGroupDto, user_1);

      expect(createdGroup.name).toBe(createGroupDto.name);
      expect(createdGroup.admin_id).toBe(user_1);
      expect(createdGroup.created_by_id).toBe(user_1);
      expect(createdGroup.description).toBe(createGroupDto.description);

      expect(createdGroup.group_membership[0].user_id).toBe(user_1);
      expect(createdGroup.group_membership[1].user_id).toBe(user_2);

      group_id = createdGroup.id;
    });

    it('should return exception if user that create group not exist', async () => {
      const createGroupDto = {
        name: 'group_name_2',
        description: 'group_description',
        members: [user_1, user_2],
      };

      await expect(
        groupController.create(createGroupDto, 'not_exist_user_id'),
      ).rejects.toThrowError();
    });

    it('should add(create) group membership and return record', async () => {
      const addMmeberDto = {
        group_id,
        members: [user_3],
      };

      const addedMembers = await groupController.addMembers(
        addMmeberDto,
        user_1,
      );

      const user_3_membership = addedMembers.find((member) => {
        return member.user_id === user_3;
      });

      expect(user_3_membership.group_id).toBe(group_id);
      expect(user_3_membership.user_id).toBe(user_3);
    });

    it('should return exception if user that need to be add to a group not exist', async () => {
      const addMmeberDto = {
        group_id,
        members: ['not_exist_user_id'],
      };

      await expect(
        groupController.addMembers(addMmeberDto, user_1),
      ).rejects.toThrowError();
    });

    it('should return exception if a group not exist when adding member', async () => {
      const addMmeberDto = {
        group_id: 'not_exist_group_id',
        members: ['user_4'],
      };

      await expect(
        groupController.addMembers(addMmeberDto, user_1),
      ).rejects.toThrowError();
    });

    it('should return exception if non_admin adding member', async () => {
      const addMmeberDto = {
        group_id,
        members: ['user_4'],
      };

      await expect(
        groupController.addMembers(addMmeberDto, 'not_admin_id'),
      ).rejects.toThrowError();
    });

    it('should find group', async () => {
      const group = await groupController.findOne(group_id);

      expect(group.name).toEqual('group_name');
      expect(group.description).toEqual('group_description');
      expect(group.admin_id).toEqual(user_1);
      expect(group.created_by_id).toEqual(user_1);
    });

    it('should return exception if group is not found', async () => {
      jest.spyOn(groupController, 'findOne').mockRejectedValue(new Error());

      await expect(
        groupController.findOne('not_exist_group_id'),
      ).rejects.toThrowError();
    });

    it('should find groups', async () => {
      const [createdGroup] = await groupController.findAll(user_1);

      expect(createdGroup.name).toEqual('group_name');
      expect(createdGroup.description).toEqual('group_description');
      expect(createdGroup.admin_id).toEqual(user_1);
      expect(createdGroup.created_by_id).toEqual(user_1);

      const members = [user_1, user_2, user_3];

      createdGroup.group_membership.forEach(({ user_id, group_id }, idx) => {
        expect(user_id).toBe(members[idx]);
        expect(group_id).toBe(createdGroup.id);
      });
    });

    it('should return empty array if user not joined any group', async () => {
      await expect(groupController.findAll('user_5')).resolves.toEqual([]);
    });

    it('should update group and return record', async () => {
      const updateGroupDto = {
        description: 'new_description',
        name: 'new group name',
        new_admin: user_2,
      };

      const updatedGroup = await groupController.updateGroup(
        group_id,
        updateGroupDto,
        user_1,
      );

      expect(updatedGroup.id).toEqual(group_id);
      expect(updatedGroup.admin_id).toEqual(user_2);
      expect(updatedGroup.created_by_id).toEqual(user_1);
      expect(updatedGroup.description).toEqual(updateGroupDto.description);
      expect(updatedGroup.name).toEqual(updateGroupDto.name);
    });

    it('should return exception if group admin changed to non exist user', async () => {
      const updateGroupDto = {
        description: 'change description',
        name: 'change group name',
        new_admin: 'not_exist_user_id',
      };

      await expect(
        groupController.updateGroup(group_id, updateGroupDto, user_2),
      ).rejects.toThrowError();
    });

    it('should return exception if non admin trying to update group', async () => {
      const updateGroupDto = {
        description: 'new description',
        name: 'group name',
      };

      await expect(
        groupController.updateGroup(group_id, updateGroupDto, user_1),
      ).rejects.toThrowError();
    });

    it('should return exception if group not found when update group', async () => {
      const updateGroupDto = {
        description: 'desc',
        name: 'new group name 2',
        new_admin: user_3,
      };

      await expect(
        groupController.updateGroup(
          'not_exist_group_id',
          updateGroupDto,
          user_2,
        ),
      ).rejects.toThrowError();
    });

    it('should return exception if non admin trying to delete group', async () => {
      await expect(
        groupController.remove(group_id, user_1),
      ).rejects.toThrowError();
    });

    it('should delete group member', async () => {
      const deleteMemberDto = {
        group_id,
        members: [user_3],
      };

      const updatedGroup = await groupController.deleteMembers(
        deleteMemberDto,
        user_2,
      );

      const members = [user_1, user_2];

      updatedGroup.forEach(({ group_id, user_id }, idx) => {
        expect(group_id).toBe(group_id);
        expect(user_id).toBe(members[idx]);
      });
    });

    it('should return exception non admin trying to delete group member', async () => {
      const deleteMemberDto = {
        group_id,
        members: [user_2],
      };

      await expect(
        groupController.deleteMembers(deleteMemberDto, user_1),
      ).rejects.toThrowError();
    });

    it('should exit from group', async () => {
      await expect(
        groupController.exitGroup(group_id, user_1, user_2),
      ).resolves.toBeUndefined();

      const shouldBeNull = await prismaService.groupMembership.findFirst({
        where: { group_id, user_id: user_2 },
      });

      expect(shouldBeNull).toBeNull();
    });

    it('should return exception if group not found when trying to exit from group', async () => {
      await expect(
        groupController.exitGroup('not_exist_group_id', user_1, user_2),
      ).rejects.toThrowError();
    });

    it('should delete group', async () => {
      await expect(
        groupController.remove(group_id, user_1),
      ).resolves.toBeUndefined();

      await expect(
        prismaService.group.findFirst({
          where: { id: group_id },
        }),
      ).resolves.toBeNull();
    });

    it('should return exception if group not found when trying to delete group', async () => {
      await expect(
        groupController.remove('not_exist_group_id', user_2),
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
