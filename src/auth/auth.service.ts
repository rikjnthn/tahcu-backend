import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';
import { UserType } from 'src/users/interface/user.interface';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser({ user_idOrEmail, password }: LoginDto) {
    const user = isEmail(user_idOrEmail)
      ? await this.usersService.findOneEmail(user_idOrEmail)
      : await this.usersService.findOneId(user_idOrEmail);

    if (!user)
      throw new BadRequestException({
        error: 'Bad Request Exception',
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
    return { access_token: await this.generateToken(user) };
  }

  private async generateToken(user: UserType) {
    const payload = {
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRED,
    });
  }

  async login(loginDto: LoginDto) {
    return await this.validateUser(loginDto);
  }

  async signUp(signUpDto: SignUpDto) {
    await this.usersService.create(signUpDto);

    return await this.validateUser({
      user_idOrEmail: signUpDto.user_id,
      password: signUpDto.password,
    });
  }
}
