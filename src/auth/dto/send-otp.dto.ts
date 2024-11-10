import { PickType } from '@nestjs/mapped-types';

import { SignUpDto } from './sign-up.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SendOTPDto extends PickType(SignUpDto, ['email']) {
  @IsString({ message: 'user id should be a string' })
  @IsOptional()
  @MinLength(4, {
    message: 'user id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    message: 'user id should contain a maximum of 20 letters',
  })
  user_id?: string;
}
