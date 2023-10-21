import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { GroupService } from './group.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { GroupController } from './group.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

describe('GroupController', () => {
  describe('Unit Testing', () => {
    let prismaService: PrismaService;
    let groupService: GroupService;
    let groupController: GroupController;

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
        name: 'group uhuy',
        description: 'group aja',
        members: ['andi', 'dina'],
      };

      const createdGroupMock = {
        id: '1',
        name: 'group uhuy',
        description: 'group aja',
        created_at: new Date(),
        admin_id: 'andi',
        created_by_id: 'andi',
        group_membership: [
          {
            id: '1',
            user_id: 'andi',
            group_id: '1',
            joined_at: new Date(),
          },
          {
            id: '2',
            user_id: 'dina',
            group_id: '1',
            joined_at: new Date(),
          },
        ],
      };

      jest.spyOn(groupService, 'create').mockResolvedValue(createdGroupMock);

      const createdGroup = await groupController.create(createGroupDto, 'andi');

      expect(groupService.create).toBeCalled();
      expect(groupService.create).toBeCalledWith(createGroupDto, 'andi');

      expect(createdGroup).toEqual(createdGroupMock);
    });

    it('should return exception if user that create group not exist', async () => {
      const createGroupDto = {
        name: 'group uhuy',
        description: 'group aja',
        members: ['andi', 'dina'],
      };

      jest.spyOn(groupService, 'create').mockRejectedValue(new Error());

      await expect(
        groupController.create(createGroupDto, 'not_exist'),
      ).rejects.toThrowError();
    });

    it('should add(create) group membership and return record', async () => {
      const addMmeberDto = {
        group_id: '3',
        members: ['doni'],
      };

      const addedMemberMock = [
        {
          id: '3',
          user_id: 'doni',
          group_id: '1',
          joined_at: new Date(),
        },
      ];

      jest.spyOn(groupService, 'addMembers').mockResolvedValue(addedMemberMock);

      const addedMember = await groupController.addMembers(
        addMmeberDto,
        'doni',
      );

      expect(groupService.addMembers).toBeCalled();
      expect(groupService.addMembers).toBeCalledWith(addMmeberDto, 'doni');

      expect(addedMember).toEqual(addedMemberMock);
    });

    it('should return exception if user that need to be add to a group not exist', async () => {
      const addMemberDto = {
        group_id: '1',
        members: ['not_exist'],
      };

      jest.spyOn(groupService, 'addMembers').mockRejectedValue(new Error());

      await expect(
        groupController.addMembers(addMemberDto, '1'),
      ).rejects.toThrowError();
    });

    it('should return exception if a group not exist when adding member', async () => {
      const addMemberDto = {
        group_id: 'not_exist',
        members: ['dion'],
      };

      jest.spyOn(groupService, 'addMembers').mockRejectedValue(new Error());

      await expect(
        groupController.addMembers(addMemberDto, '1'),
      ).rejects.toThrowError();
    });

    it('should return exception if a non admin adding member', async () => {
      const addMemberDto = {
        group_id: '1',
        members: ['dion'],
      };

      jest.spyOn(groupService, 'addMembers').mockRejectedValue(new Error());

      await expect(
        groupController.addMembers(addMemberDto, 'non_admin'),
      ).rejects.toThrowError();
    });

    it('should find group', async () => {
      const foundGroupMock = [
        {
          id: '1',
          name: 'group uhuy',
          description: 'group aja',
          created_at: new Date(),
          admin_id: 'andi',
          created_by_id: 'andi',
          group_membership: [
            {
              id: '1',
              user_id: 'andi',
              group_id: '1',
              joined_at: new Date(),
            },
            {
              id: '2',
              user_id: 'dina',
              group_id: '1',
              joined_at: new Date(),
            },
            {
              id: '3',
              user_id: 'doni',
              group_id: '1',
              joined_at: new Date(),
            },
          ],
        },
      ];

      jest.spyOn(groupService, 'findAll').mockResolvedValue(foundGroupMock);

      const createdGroup = await groupController.findAll('andi');

      expect(groupService.findAll).toBeCalled();
      expect(groupService.findAll).toBeCalledWith('andi');

      expect(createdGroup).toEqual(foundGroupMock);
    });

    it('should return empty array if user not joined any group', async () => {
      jest.spyOn(groupService, 'findAll').mockResolvedValue([]);

      await expect(groupController.findAll('no_group_user')).resolves.toEqual(
        [],
      );
    });

    it('should update group and return record', async () => {
      const updateGroupDto = {
        description: 'ganti desc',
        name: 'ganti nama group',
        new_admin: 'dina',
      };

      const updatedGroupMock = {
        id: '1',
        name: 'ganti nama group',
        description: 'ganti desc',
        created_at: new Date(),
        admin_id: 'dina',
        created_by_id: 'andi',
      };
      jest
        .spyOn(groupService, 'updateGroup')
        .mockResolvedValue(updatedGroupMock);

      const updatedGroup = await groupController.updateGroup(
        '1',
        updateGroupDto,
        '1',
      );

      expect(groupService.updateGroup).toBeCalled();
      expect(groupService.updateGroup).toBeCalledWith('1', updateGroupDto, '1');

      expect(updatedGroup).toEqual(updatedGroupMock);
    });

    it('should return exception if group admin changed to non exist user', async () => {
      const updateGroupDto = {
        description: 'ganti desc',
        name: 'ganti nama group',
        new_admin: 'not_exist',
      };

      jest.spyOn(groupService, 'updateGroup').mockRejectedValue(new Error());

      await expect(
        groupController.updateGroup('1', updateGroupDto, '1'),
      ).rejects.toThrowError();
    });

    it('should return exception if non admin trying to update group', async () => {
      const updateGroupDto = {
        description: 'ganti desc',
        name: 'ganti nama group',
        new_admin: 'dina',
      };

      jest
        .spyOn(groupService, 'updateGroup')
        .mockRejectedValue(
          new UnauthorizedException(
            'You were not permitted to delete this group',
          ),
        );

      await expect(
        groupController.updateGroup('1', updateGroupDto, 'non_admin'),
      ).rejects.toThrowError(
        new UnauthorizedException(
          'You were not permitted to delete this group',
        ),
      );
    });

    it('should return exception if group not found when update group', async () => {
      const updateGroupDto = {
        description: 'ganti desc',
        name: 'ganti nama group',
        new_admin: 'dina',
      };

      jest
        .spyOn(groupService, 'updateGroup')
        .mockRejectedValue(new NotFoundException());

      await expect(
        groupController.updateGroup('not_exist', updateGroupDto, '1'),
      ).rejects.toThrowError(new NotFoundException());
    });

    it('should delete group', async () => {
      jest.spyOn(groupService, 'remove').mockResolvedValue(undefined);

      const updatedGroup = await groupController.remove('1', '1');

      expect(groupService.remove).toBeCalled();
      expect(groupService.remove).toBeCalledWith('1', '1');

      expect(updatedGroup).toBeUndefined();
    });

    it('should return exception if non admin trying to delete group', async () => {
      jest
        .spyOn(groupService, 'remove')
        .mockRejectedValue(
          new UnauthorizedException(
            'You were not permitted to delete this group',
          ),
        );

      await expect(
        groupController.remove('1', 'non_admin'),
      ).rejects.toThrowError(
        new UnauthorizedException(
          'You were not permitted to delete this group',
        ),
      );
    });

    it('should return exception if group not found when trying to delete group', async () => {
      jest
        .spyOn(groupService, 'remove')
        .mockRejectedValue(new NotFoundException());

      await expect(
        groupController.remove('not_exist', '1'),
      ).rejects.toThrowError(new NotFoundException());
    });

    it('should delete group member', async () => {
      const deleteMemberDto = {
        group_id: '1',
        members: ['3'],
      };

      const deletedMemberMock = [
        {
          id: '1',
          user_id: 'andi',
          group_id: '1',
          joined_at: new Date(),
        },
        {
          id: '2',
          user_id: 'dina',
          group_id: '1',
          joined_at: new Date(),
        },
      ];

      jest
        .spyOn(groupService, 'deleteMembers')
        .mockResolvedValue(deletedMemberMock);

      const updatedGroup = await groupController.deleteMembers(
        deleteMemberDto,
        '1',
      );

      expect(groupService.deleteMembers).toBeCalled();
      expect(groupService.deleteMembers).toBeCalledWith(deleteMemberDto, '1');

      expect(updatedGroup).toEqual(deletedMemberMock);
    });

    it('should return exception when delete group member that not exist', async () => {
      const deleteMemberDto = {
        group_id: '1',
        members: ['not_exist'],
      };

      jest.spyOn(groupService, 'deleteMembers').mockRejectedValue(new Error());

      await expect(
        groupController.deleteMembers(deleteMemberDto, 'non_admin'),
      ).rejects.toThrowError(new Error());
    });

    it('should return exception non admin trying to delete group member', async () => {
      const deleteMemberDto = {
        group_id: '1',
        members: ['3'],
      };

      jest
        .spyOn(groupService, 'deleteMembers')
        .mockRejectedValue(
          new UnauthorizedException(
            'You were not permitted to add member this group',
          ),
        );

      await expect(
        groupController.deleteMembers(deleteMemberDto, 'non_admin'),
      ).rejects.toThrowError(
        new UnauthorizedException(
          'You were not permitted to add member this group',
        ),
      );
    });

    it('should exit from group', async () => {
      jest.spyOn(groupService, 'exitGroup').mockResolvedValue(undefined);

      const exitGroup = await groupController.exitGroup('1', '1');

      expect(groupService.exitGroup).toBeCalled();
      expect(groupService.exitGroup).toBeCalledWith('1', '1');

      expect(exitGroup).toBeUndefined();
    });

    it('should return exception if group not found when trying to exit from group', async () => {
      jest.spyOn(groupService, 'exitGroup').mockRejectedValue(new Error());

      await expect(
        groupController.exitGroup('not_exist', '1'),
      ).rejects.toThrowError();
    });
  });

  describe('Integration Testing', () => {
    let prismaService: PrismaService;
    let groupController: GroupController;

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
        ],
        controllers: [GroupController],
        providers: [GroupService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      groupController = module.get<GroupController>(GroupController);
    });

    beforeAll(async () => {
      await prismaService.users.createMany({
        data: [
          {
            email: 'andi@gmail.com',
            is_active: true,
            password: 'password',
            user_id: 'andi',
            username: 'andi',
          },
          {
            email: 'dina@gmail.com',
            is_active: true,
            password: 'password',
            user_id: 'dina',
            username: 'dina',
          },
        ],
      });
    });

    it('should be defined', () => {
      expect(groupController).toBeDefined();
    });

    it('should create group and return record', async () => {
      const [andi, dina] = await prismaService.users.findMany({
        select: { id: true },
        where: { OR: [{ user_id: 'andi' }, { user_id: 'dina' }] },
      });

      const createGroupDto = {
        name: 'group uhuy',
        description: 'group aja',
        members: [andi.id, dina.id],
      };

      const createdGroup = await groupController.create(
        createGroupDto,
        andi.id,
      );

      expect(createdGroup.name).toBe('group uhuy');
      expect(createdGroup.admin_id).toBe(andi.id);
      expect(createdGroup.description).toBe('group aja');
      expect(createdGroup.created_by_id).toBe(andi.id);

      expect(createdGroup.group_membership[0].user_id).toBe(andi.id);
      expect(createdGroup.group_membership[1].user_id).toBe(dina.id);
    });

    it('should return exception if user that create group not exist', async () => {
      const [andi, dina] = await prismaService.users.findMany({
        select: { id: true },
        where: { OR: [{ user_id: 'andi' }, { user_id: 'dina' }] },
      });

      const createGroupDto = {
        name: 'group uhuy',
        description: 'group aja',
        members: [andi.id, dina.id],
      };

      await expect(
        groupController.create(createGroupDto, 'not_exist'),
      ).rejects.toThrowError();
    });

    it('should add(create) group membership and return record', async () => {
      const group = await prismaService.group.findFirst({
        where: {
          name: 'group uhuy',
        },
      });

      const doni = await prismaService.users.create({
        data: {
          email: 'doni@gmail.com',
          is_active: true,
          password: 'password',
          user_id: 'doni',
          username: 'doni',
        },
      });

      const andi = await prismaService.users.findFirst({
        where: {
          username: 'andi',
        },
      });

      const addMmeberDto = {
        group_id: group.id,
        members: [doni.id],
      };

      const addedMember = await groupController.addMembers(
        addMmeberDto,
        andi.id,
      );

      expect(addedMember[0].group_id).toBe(group.id);
      expect(addedMember[0].user_id).toBe(doni.id);
    });

    it('should return exception if user that need to be add to a group not exist', async () => {
      const group = await prismaService.group.findFirst({
        where: {
          name: 'group uhuy',
        },
      });

      const andi = await prismaService.users.findFirst({
        where: {
          username: 'andi',
        },
      });

      const addMmeberDto = {
        group_id: group.id,
        members: ['not_exist'],
      };
      await expect(
        groupController.addMembers(addMmeberDto, andi.id),
      ).rejects.toThrowError();
    });

    it('should return exception if a group not exist when adding member', async () => {
      const doni = await prismaService.users.findFirst({
        where: {
          username: 'doni',
        },
      });

      const andi = await prismaService.users.findFirst({
        where: {
          username: 'andi',
        },
      });

      const addMmeberDto = {
        group_id: 'not_exist',
        members: [doni.id],
      };
      await expect(
        groupController.addMembers(addMmeberDto, andi.id),
      ).rejects.toThrowError();
    });

    it('should return exception if non_admin adding member', async () => {
      const group = await prismaService.group.findFirst({
        where: {
          name: 'group uhuy',
        },
      });

      const doni = await prismaService.users.findFirst({
        where: {
          username: 'doni',
        },
      });

      const addMmeberDto = {
        group_id: group.id,
        members: [doni.id],
      };
      await expect(
        groupController.addMembers(addMmeberDto, 'non_admin'),
      ).rejects.toThrowError();
    });

    it('should find group', async () => {
      const [andi, dina, doni] = await prismaService.users.findMany({
        where: {
          OR: [
            {
              username: 'andi',
            },
            {
              username: 'dina',
            },
            {
              username: 'doni',
            },
          ],
        },
      });

      const [createdGroup] = await groupController.findAll(andi.id);

      expect(createdGroup.name).toEqual('group uhuy');
      expect(createdGroup.description).toEqual('group aja');
      expect(createdGroup.admin_id).toEqual(andi.id);
      expect(createdGroup.created_by_id).toEqual(andi.id);

      const members = [andi.id, dina.id, doni.id];

      createdGroup.group_membership.forEach(({ user_id, group_id }, idx) => {
        expect(user_id).toBe(members[idx]);
        expect(group_id).toBe(createdGroup.id);
      });
    });

    it('should return empty array if user not joined any group', async () => {
      const andre = await prismaService.users.create({
        data: {
          email: 'andre@gmail.com',
          is_active: true,
          password: 'password',
          user_id: 'andre',
          username: 'andre',
        },
      });

      await expect(groupController.findAll(andre.id)).resolves.toEqual([]);
    });

    it('should update group and return record', async () => {
      const andi = await prismaService.users.findFirst({
        where: {
          username: 'andi',
        },
      });
      const dina = await prismaService.users.findFirst({
        where: {
          username: 'dina',
        },
      });

      const group = await prismaService.group.findFirst({
        where: { name: 'group uhuy' },
      });

      const updateGroupDto = {
        description: 'ganti desc',
        name: 'ganti nama group',
        new_admin: dina.id,
      };

      const updatedGroup = await groupController.updateGroup(
        group.id,
        updateGroupDto,
        andi.id,
      );

      expect(updatedGroup.id).toEqual(group.id);
      expect(updatedGroup.admin_id).toEqual(dina.id);
      expect(updatedGroup.description).toEqual('ganti desc');
      expect(updatedGroup.name).toEqual('ganti nama group');
    });

    it('should return exception if group admin changed to non exist user', async () => {
      const updateGroupDto = {
        description: 'ganti desc',
        name: 'ganti nama group',
        new_admin: 'not_exist',
      };

      const [dina] = await prismaService.users.findMany({
        where: {
          username: 'dina',
        },
      });

      const group = await prismaService.group.findFirst({
        where: { name: 'ganti nama group' },
      });

      await expect(
        groupController.updateGroup(group.id, updateGroupDto, dina.id),
      ).rejects.toThrowError();
    });

    it('should return exception if non admin trying to update group', async () => {
      const updateGroupDto = {
        description: 'ganti desc',
        name: 'ganti nama group',
      };

      const [andi] = await prismaService.users.findMany({
        where: {
          username: 'andi',
        },
      });

      const group = await prismaService.group.findFirst({
        where: { name: 'ganti nama group' },
      });

      await expect(
        groupController.updateGroup(group.id, updateGroupDto, andi.id),
      ).rejects.toThrowError(
        new UnauthorizedException(
          'You were not permitted to delete this group',
        ),
      );
    });

    it('should return exception if group not found when update group', async () => {
      const updateGroupDto = {
        description: 'ganti desc',
        name: 'ganti nama group',
        new_admin: 'dina',
      };

      const [andi] = await prismaService.users.findMany({
        where: {
          username: 'andi',
        },
      });

      await expect(
        groupController.updateGroup('not_exist', updateGroupDto, andi.id),
      ).rejects.toThrowError();
    });

    it('should return exception if non admin trying to delete group', async () => {
      const [andi] = await prismaService.users.findMany({
        where: {
          username: 'andi',
        },
      });

      const group = await prismaService.group.findFirst({
        where: { name: 'ganti nama group' },
      });

      await expect(
        groupController.remove(group.id, andi.id),
      ).rejects.toThrowError(
        new UnauthorizedException(
          'You were not permitted to delete this group',
        ),
      );
    });

    it('should delete group member', async () => {
      const [andi, doni] = await prismaService.users.findMany({
        where: {
          OR: [
            {
              username: 'andi',
            },
            {
              username: 'doni',
            },
          ],
        },
      });

      const dina = await prismaService.users.findFirst({
        where: {
          username: 'dina',
        },
      });

      const group = await prismaService.group.findFirst({
        where: { name: 'ganti nama group' },
      });

      const deleteMemberDto = {
        group_id: group.id,
        members: [doni.id],
      };

      const updatedGroup = await groupController.deleteMembers(
        deleteMemberDto,
        dina.id,
      );

      const members = [andi.id, dina.id];

      updatedGroup.forEach(({ group_id, user_id }, idx) => {
        expect(group_id).toBe(group.id);
        expect(user_id).toBe(members[idx]);
      });
    });

    it('should return exception when delete group member that not exist', async () => {
      const [dina] = await prismaService.users.findMany({
        where: {
          username: 'dina',
        },
      });

      const group = await prismaService.group.findFirst({
        where: { name: 'ganti nama group' },
      });

      const deleteMemberDto = {
        group_id: group.id,
        members: ['not_exist'],
      };

      await expect(
        groupController.deleteMembers(deleteMemberDto, dina.id),
      ).rejects.toThrowError();
    });

    it('should return exception non admin trying to delete group member', async () => {
      const [andi, dina] = await prismaService.users.findMany({
        where: {
          OR: [{ username: 'andi' }, { username: 'dina' }],
        },
      });

      const group = await prismaService.group.findFirst({
        where: { name: 'ganti nama group' },
      });

      const deleteMemberDto = {
        group_id: group.id,
        members: [dina.id],
      };

      await expect(
        groupController.deleteMembers(deleteMemberDto, andi.id),
      ).rejects.toThrowError(
        new UnauthorizedException(
          'You were not permitted to add member this group',
        ),
      );
    });

    it('should exit from group', async () => {
      const [andi] = await prismaService.users.findMany({
        where: {
          username: 'andi',
        },
      });

      const group = await prismaService.group.findFirst({
        where: { name: 'ganti nama group' },
      });

      const exitGroup = await groupController.exitGroup(group.id, andi.id);

      expect(exitGroup).toBeUndefined();
    });

    it('should return exception if group not found when trying to exit from group', async () => {
      const [andi] = await prismaService.users.findMany({
        where: {
          username: 'andi',
        },
      });

      await expect(
        groupController.exitGroup('not_exist', andi.id),
      ).rejects.toThrowError();
    });

    it('should delete group', async () => {
      const [dina] = await prismaService.users.findMany({
        where: {
          username: 'dina',
        },
      });

      const group = await prismaService.group.findFirst({
        where: { name: 'ganti nama group' },
      });

      const updatedGroup = await groupController.remove(group.id, dina.id);

      expect(updatedGroup).toBeUndefined();
    });

    it('should return exception if group not found when trying to delete group', async () => {
      const [dina] = await prismaService.users.findMany({
        where: {
          username: 'dina',
        },
      });

      await expect(
        groupController.remove('not_exist', dina.id),
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
