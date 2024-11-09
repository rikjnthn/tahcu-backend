import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { ContactType } from './interface/private-chat.interface';

@Injectable()
export class PrivateChatService {
  private readonly contactInclude = {
    user: {
      select: {
        username: true,
        email: true,
      },
    },
    friends: {
      select: {
        username: true,
        email: true,
      },
    },
  };

  private readonly logger = new Logger(PrivateChatService.name);

  constructor(private prismaService: PrismaService) {}

  /**
   * Add new contact
   *
   * @param friends_id
   * @param user_id
   *
   * @returns contact data
   */
  async create(friends_id: string, user_id: string): Promise<ContactType> {
    this.logger.log('Start creating a private chat');

    if (friends_id === user_id) {
      this.logger.warn('User id and friends id are the same');

      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'user id and friends id should not be the same',
        },
      });
    }

    try {
      const createdChat = await this.prismaService.contact.create({
        data: { friends_id, user_id },
        include: this.contactInclude,
      });

      this.logger.log('Private chat created');

      return createdChat;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          this.logger.warn('Friends id not found');

          throw new BadRequestException({
            error: {
              code: 'NOT_FOUND',
              message: 'Friends id was not found',
            },
          });
        }

        if (error.code === 'P2002') {
          this.logger.warn('Duplicate private chat');

          throw new BadRequestException({
            error: {
              code: 'DUPLICATE_VALUE',
              message: 'The contact already exists',
            },
          });
        }
      }

      throw error;
    }
  }

  /**
   * Find contacts that have user's user id
   *
   * @param user_id
   *
   * @returns array of contacts data
   */
  async findAll(user_id: string): Promise<ContactType[]> {
    this.logger.log('Find private chats');

    return await this.prismaService.contact.findMany({
      where: { OR: [{ user_id }, { friends_id: user_id }] },
      include: this.contactInclude,
    });
  }

  /**
   * Delete contact
   *
   * @param id contact id to remove contact
   */
  async remove(id: string): Promise<void> {
    this.logger.log('Start deleting private chat');

    try {
      await this.prismaService.contact.delete({
        where: { id },
      });

      this.logger.log('Private chat deleted');
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn('Private chat not found');

          throw new BadRequestException({
            error: {
              code: 'NOT_FOUND',
              message: 'Contact to delete was not found',
            },
          });
        }
      }

      throw error;
    }
  }
}
