import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets/errors';

import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FindMessageDto } from './dto/find-messages.dto';

@Injectable()
export class MessageService {
  constructor(private prismaService: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    if (createMessageDto.receiver_id === createMessageDto.sender_id) {
      throw new WsException({
        status: 'error',
        message: 'sender id and receiver id should not be equal',
      });
    }

    const createdMessage = await this.prismaService.message.create({
      data: createMessageDto,
    });
    return createdMessage;
  }

  async findAll({ sender_id, receiver_id, lower_limit }: FindMessageDto) {
    return await this.prismaService.message.findMany({
      where: {
        OR: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      },
      skip: lower_limit,
    });
  }

  async update(id: string, updateMessageDto: UpdateMessageDto) {
    if (updateMessageDto.receiver_id === updateMessageDto.sender_id) {
      throw new WsException({
        status: 'error',
        message: 'sender id and receiver id should not be equal',
      });
    }

    const [updatedMessage] = await this.prismaService.$transaction([
      this.prismaService.message.update({
        where: {
          id,
        },
        data: updateMessageDto,
      }),
    ]);

    return updatedMessage;
  }

  async remove(ids: string[]) {
    await this.prismaService.$transaction(
      ids.map((id) => {
        return this.prismaService.message.delete({
          where: {
            id,
          },
        });
      }),
    );
  }
}
