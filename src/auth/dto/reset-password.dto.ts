import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

import { SignUpDto } from './sign-up.dto';

export class ResetPasswordDto extends PickType(SignUpDto, [
  'email',
  'password',
]) {
  @IsString({ message: 'otp should be string' })
  @IsNotEmpty({ message: 'otp should not be empty' })
  otp: string;
}
