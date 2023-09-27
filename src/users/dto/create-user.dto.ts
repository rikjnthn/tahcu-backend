import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Length,
  IsBoolean,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(4)
  user_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(4)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  password: string;

  @IsEmail()
  @Matches(/@gmail.com$/, {
    message: 'Email domain must be Gmail',
  })
  @IsNotEmpty()
  email: string;

  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}
