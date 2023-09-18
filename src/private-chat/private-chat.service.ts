import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import { UpdatePrivateChatDto } from './dto/update-private-chat.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RequestUser } from 'src/common/interface/request-user.interface';

@Injectable()
export class PrivateChatService {
  constructor(private prismaService: PrismaService) {}

  async create(createPrivateChatDto: CreatePrivateChatDto) {
    if (createPrivateChatDto.friends_id === createPrivateChatDto.user_id) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'user id and friends id should not be equal',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const [createdChat] = await this.prismaService.$transaction([
      this.prismaService.contact.create({
        data: createPrivateChatDto,
      }),
    ]);

    return createdChat;
  }

  async findAll(request: Request) {
    const user = request.user as RequestUser;
    const user_id = user.id;
    return await this.prismaService.contact.findMany({
      where: {
        user_id,
      },
    });
  }

  async update(id: string, updatePrivateChatDto: UpdatePrivateChatDto) {
    if (updatePrivateChatDto.friends_id === updatePrivateChatDto.user_id) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'user_id and friends_id should not be equal',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const [updatedChat] = await this.prismaService.$transaction([
      this.prismaService.contact.update({
        where: {
          id,
        },
        data: updatePrivateChatDto,
      }),
    ]);
    return updatedChat;
  }

  async remove(ids: string[]) {
    await this.prismaService.$transaction(
      ids.map((id) =>
        this.prismaService.contact.delete({
          where: {
            id,
          },
        }),
      ),
    );
  }
}
