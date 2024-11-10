import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

import { SignUpDto } from './sign-up.dto';

export class LoginDto extends PickType(SignUpDto, ['password']) {
  @IsString({ message: 'user id or email should be a string' })
  @IsNotEmpty({ message: 'user id or email should not be empty' })
  user_idOrEmail: string;
}
