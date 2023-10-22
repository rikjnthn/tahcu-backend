import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { FindGroupMessageDto } from './dto/find-group-message.dto';
import { UpdateGroupMessageDto } from './dto/update-group-message.dto';

@Injectable()
export class GroupMessageService {
  constructor(private prismaService: PrismaService) {}

  async create(createGroupMessageDto: CreateGroupMessageDto, userId: string) {
    const isGroupExist = await this.prismaService.group.findFirst({
      where: {
        id: createGroupMessageDto.group_id,
      },
    });

    if (!isGroupExist) throw new WsException('Group is not exist');

    const createdMessage = await this.prismaService.message.create({
      data: {
        ...createGroupMessageDto,
        sender_id: userId,
      },
    });

    return createdMessage;
  }

  async findAll(findGroupMessageDto: FindGroupMessageDto) {
    const { group_id, skip } = findGroupMessageDto;
    return await this.prismaService.message.findMany({
      where: {
        group_id,
      },
      take: 20,
      skip,
    });
  }

  async update(
    updateGroupMessageDto: UpdateGroupMessageDto,
    sender_id: string,
  ) {
    const { group_id, message, message_id } = updateGroupMessageDto;
    const [updatedMessage] = await this.prismaService.$transaction([
      this.prismaService.message.update({
        where: {
          id: message_id,
          group_id,
          sender_id,
        },
        data: {
          message,
        },
      }),
    ]);

    return updatedMessage;
  }

  async delete(ids: string[], group_id: string, sender_id: string) {
    this.prismaService.$transaction(
      ids.map((id) =>
        this.prismaService.message.delete({
          where: {
            id,
            group_id,
            sender_id,
          },
        }),
      ),
    );
  }
}
