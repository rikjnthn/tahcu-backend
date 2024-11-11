import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets/errors';
import { Prisma } from '@prisma/client';

import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FindMessageDto } from './dto/find-messages.dto';
import { MessageType } from './interface/message.interface';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  private readonly includeMessage = {
    sender: {
      select: {
        username: true,
      },
    },
  };

  constructor(private prismaService: PrismaService) {}

  /**
   * Create message
   *
   * @param createMessageDto dto to create message
   *
   * @returns message data
   */
  async create(createMessageDto: CreateMessageDto): Promise<MessageType> {
    this.logger.log('Start creating a message');

    const { contact_id, group_id } = createMessageDto;

    if (contact_id && group_id) {
      this.logger.warn('Both contact id and group id are present');

      throw new WsException({
        error: {
          code: 'VALIDATION_ERROR',
          message:
            'Either a contact id or a group id should be provided, not both',
        },
      });
    }

    try {
      const createdMessage = await this.prismaService.message.create({
        data: createMessageDto,
        include: this.includeMessage,
      });

      this.logger.log('Message created');

      return createdMessage;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          /**
           * Get the field that cause the problem and remove the '(index)'
           *
           * @example "fk__Table__field (index)" => "field"
           */
          const errorField = (error.meta.field_name as string)
            .split('__')[2]
            .replace(' (index)', '');

          this.logger.warn(`${errorField} not found`);

          throw new WsException({
            error: {
              code: 'NOT_FOUND',
              message: `${errorField} was not found`,
            },
          });
        }
      }

      throw error;
    }
  }

  /**
   * Find multiple messages
   *
   * @param findMessageDto dto to find messages
   *
   * @returns array of messages data
   */
  async findAll({
    contact_id,
    group_id,
    skip,
  }: FindMessageDto): Promise<MessageType[]> {
    this.logger.log('Find the messages');

    if (contact_id && group_id) {
      this.logger.warn('Both contact id and group id are present');
      throw new WsException({
        error: {
          code: 'VALIDATION_ERROR',
          message:
            'Either a Contact ID or a Group ID should be provided, not both',
        },
      });
    }

    return await this.prismaService.message.findMany({
      where: {
        OR: [{ contact_id }, { group_id }],
      },
      include: this.includeMessage,
      skip,
      take: 50,
      orderBy: {
        sent_at: 'desc',
      },
    });
  }

  /**
   * Update message
   *
   * @param updateMessageDto dto to update message
   *
   * @returns updated message data
   */
  async update(updateMessageDto: UpdateMessageDto): Promise<MessageType> {
    this.logger.log('Start updating the message');

    const { id, message } = updateMessageDto;

    try {
      const updatedMessage = await this.prismaService.message.update({
        where: { id },
        data: { message },
        include: this.includeMessage,
      });

      this.logger.log('Message updated');

      return updatedMessage;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn('Message not found');
          throw new WsException({
            error: {
              code: 'NOT_FOUND',
              message: 'Message to update was not found',
            },
          });
        }
      }

      throw error;
    }
  }

  /**
   * Delete multiple messages
   *
   * @param ids ids to remove messages
   */
  async remove(ids: string[]): Promise<void> {
    this.logger.log('Start deleting the messages');

    await this.prismaService.message.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    this.logger.log('Messages deleted');
  }
}
