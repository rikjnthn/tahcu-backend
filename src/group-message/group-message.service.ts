import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { FindGroupMessageDto } from './dto/find-group-message.dto';
import { UpdateGroupMessageDto } from './dto/update-group-message.dto';

@Injectable()
export class GroupMessageService {
  constructor(private prismaService: PrismaService) {}

  async create(createGroupMessageDto: CreateGroupMessageDto, userId: string) {
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

  async update(updateGroupMessageDto: UpdateGroupMessageDto) {
    const { group_id, message, message_id } = updateGroupMessageDto;
    const [updatedMessage] = await this.prismaService.$transaction([
      this.prismaService.message.update({
        where: {
          id: message_id,
          group_id,
        },
        data: {
          message,
        },
      }),
    ]);

    return updatedMessage;
  }

  async delete(ids: string[], group_id) {
    this.prismaService.$transaction(
      ids.map((id) =>
        this.prismaService.message.delete({
          where: {
            group_id,
            id,
          },
        }),
      ),
    );
  }
}
