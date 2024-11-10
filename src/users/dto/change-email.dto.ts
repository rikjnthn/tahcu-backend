import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, Length } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class ChangeEmailDto extends PickType(CreateUserDto, ['email']) {
  @IsNotEmpty({ message: 'otp should not be empty' })
  @IsString({ message: 'otp should be a string' })
  @Length(4, 4, { message: 'otp is not valid' })
  otp: string;
}
