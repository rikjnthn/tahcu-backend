import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UserType } from 'src/users/interface/user.interface';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser({ user_idOrEmail, password }: LoginDto): Promise<string> {
    const user = await this.prismaService.users.findFirst({
      where: {
        OR: [{ user_id: user_idOrEmail }, { email: user_idOrEmail }],
      },
    });

    if (!user)
      throw new NotFoundException({
        error: 'User not found',
        meta: {
          user: 'User Not Found',
        },
      });

    const isUser = await bcrypt.compare(password, user.password);

    if (!isUser) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        meta: {
          password: 'Wrong password',
        },
      });
    }
    return await this.generateToken(user);
  }

  private async generateToken(user: UserType): Promise<string> {
    const payload = {
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      username: user.username,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRED,
    });
  }

  async login(loginDto: LoginDto): Promise<string> {
    return await this.validateUser(loginDto);
  }

  async signUp(signUpDto: SignUpDto): Promise<string> {
    const createdUser = await this.usersService.create(signUpDto);

    return await this.generateToken(createdUser);
  }
}
