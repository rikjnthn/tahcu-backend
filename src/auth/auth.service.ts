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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(idOrEmail: string, password: string) {
    const user = isEmail(idOrEmail)
      ? await this.usersService.findOneEmail(idOrEmail)
      : await this.usersService.findOneId(idOrEmail);

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
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRED,
    });
  }

  async login(idOrEmail: string, password: string) {
    return await this.validateUser(idOrEmail, password);
  }
}
