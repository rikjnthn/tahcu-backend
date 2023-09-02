import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserType } from './interface/user.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const generatedSalt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, generatedSalt);

    return hashedPassword;
  }
  async create(createUserDto: CreateUserDto): Promise<UserType> {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const [createdUser] = await this.prisma.$transaction(
      [
        this.prisma.users.create({
          data: {
            ...createUserDto,
            password: hashedPassword,
          },
        }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return createdUser;
  }

  async find(id: string): Promise<UserType[]> {
    const users = this.prisma.users.findMany({
      where: {
        id: {
          startsWith: id,
        },
      },
    });
    return users;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserType> {
    let hashedPassword: string | undefined;

    if (updateUserDto.password) {
      hashedPassword = await this.hashPassword(updateUserDto.password);
    }

    const [updatedUser] = await this.prisma.$transaction(
      [
        this.prisma.users.update({
          where: {
            id,
          },
          data: {
            ...updateUserDto,
            password: hashedPassword,
          },
        }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.$transaction(
      [
        this.prisma.users.delete({
          where: {
            id,
          },
        }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
