import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserType } from './interface/user.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserType> {
    const [createdUser] = await this.prisma.$transaction(
      [
        this.prisma.user.create({
          data: createUserDto,
        }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return createdUser;
  }

  async find(id: string): Promise<UserType[]> {
    const users = this.prisma.user.findMany({
      where: {
        id: {
          startsWith: id,
        },
      },
    });
    return users;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserType> {
    const [updatedUser] = await this.prisma.$transaction(
      [
        this.prisma.user.update({
          where: {
            id,
          },
          data: updateUserDto,
        }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.$transaction(
      [
        this.prisma.user.delete({
          where: {
            id,
          },
        }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
