import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserType } from './interface/user.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { OtpService } from 'src/common/otp/otp.service';
import hashPassword from 'src/common/helper/hash-password';

@Injectable()
export class UsersService {
  private readonly selectUserData = {
    id: true,
    user_id: true,
    username: true,
    email: true,
    created_at: true,
    updated_at: true,
  };
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prismaService: PrismaService,
    private otpService: OtpService,
  ) {}

  /**
   * Create user
   *
   * @param createUserDto dto to create user
   *
   * @returns created user data
   */
  async create(createUserDto: CreateUserDto): Promise<UserType> {
    this.logger.log('Start creating a user');

    const hashedPassword = await hashPassword(createUserDto.password);
    try {
      const createdUser = await this.prismaService.users.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
        select: this.selectUserData,
      });

      this.logger.log('User created');

      return createdUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const errorMessage = (error.meta.target as Array<string>).map(
            (field: string) => {
              return { [field]: `${createUserDto[field]} already exist` };
            },
          );

          this.logger.warn('Duplicate user');

          throw new BadRequestException({
            error: {
              code: 'DUPLICATE_VALUE',
              message: Object.assign({}, ...errorMessage),
            },
          });
        }
      }
      throw error;
    }
  }

  /**
   * Find one user
   *
   * @param id id to find user
   *
   * @returns user data
   */
  async findOne(id: string): Promise<UserType> {
    this.logger.log('Find user');

    const user = await this.prismaService.users.findFirst({
      where: { id },
      select: this.selectUserData,
    });

    if (!user) {
      this.logger.warn('User was not found');

      throw new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'User was not found',
        },
      });
    }

    this.logger.log('User found');

    return user;
  }

  /**
   * Find multiple users with given prefix
   *
   * @param userId user id to find multiple users with this prefix
   *
   * @returns array of users data
   */
  async find(userId: string): Promise<UserType[]> {
    this.logger.log('Find users');

    const users = this.prismaService.users.findMany({
      where: {
        user_id: {
          startsWith: userId,
        },
      },
      select: this.selectUserData,
    });

    return users;
  }

  /**
   * Update user's data with new data
   *
   * @param id id to find user that need to be updated
   * @param updateUserDto dto to update user's data
   *
   * @returns updated users data
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserType> {
    this.logger.log('Start updating user');
    try {
      const updatedUser = await this.prismaService.users.update({
        where: { id },
        data: updateUserDto,
        select: this.selectUserData,
      });

      this.logger.log('User updated');

      return updatedUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const errorMessage = (error.meta.target as Array<string>).map(
            (field: string) => {
              return { [field]: `${updateUserDto[field]} already exist` };
            },
          );

          this.logger.warn('Duplicate some user field');

          throw new BadRequestException({
            error: {
              code: 'DUPLICATE_VALUE',
              message: Object.assign({}, ...errorMessage),
            },
          });
        }
      }

      throw error;
    }
  }

  /**
   * Delete user with given id
   *
   * @param id id to delete user
   */
  async remove(id: string): Promise<void> {
    this.logger.log('Start deleting user');

    try {
      await this.prismaService.users.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == 'P2025') {
          this.logger.warn('User not found');

          throw new BadRequestException({
            error: {
              code: 'NOT_FOUND',
              message: 'User to delete does not exist',
            },
          });
        }
      }

      throw error;
    }

    this.logger.log('User deleted');
  }

  /**
   *
   * @param id id to find user
   * @param changePasswordDto dto to changed user's password
   */
  async changePassword(
    id: string,
    { new_password, current_password }: ChangePasswordDto,
  ): Promise<void> {
    this.logger.log("Check user's password");

    const user = await this.prismaService.users.findFirst({
      where: { id },
    });

    if (!user) {
      this.logger.warn('User was not found');

      throw new BadRequestException({
        error: {
          code: 'NOT_FOUND',
          message: 'User was not found',
        },
      });
    }

    this.logger.log('Check password');

    const isPasswordValid = await bcrypt.compare(
      current_password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn('Passwor is wrong');

      throw new BadRequestException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Wrong password',
        },
      });
    }

    this.logger.log('Start changing password');

    await this.prismaService.users.update({
      where: { id },
      data: {
        password: await hashPassword(new_password),
      },
    });
  }

  /**
   *
   * @param id id to find user
   * @param changeEmailDto dto to change user's email
   * @returns user data with new email
   */
  async changeEmail(
    id: string,
    changeEmailDto: ChangeEmailDto,
  ): Promise<UserType> {
    this.logger.log('Start changing the email');

    //First validate otp, if valid continue
    await this.otpService.validateOtp(changeEmailDto.otp, changeEmailDto.email);

    try {
      const updatedUser = await this.prismaService.users.update({
        where: { id },
        data: { email: changeEmailDto.email },
        select: this.selectUserData,
      });

      this.logger.log('Email changed');

      return updatedUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const errorMessage = (error.meta.target as Array<string>).map(
            (field: string) => {
              return { [field]: `${changeEmailDto[field]} already exist` };
            },
          );

          this.logger.warn('Email duplicate');

          throw new BadRequestException({
            error: {
              code: 'DUPLICATE_VALUE',
              message: Object.assign({}, ...errorMessage),
            },
          });
        }
      }

      throw error;
    }
  }
}
