import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class SignUpDto {
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

  @IsString()
  @Matches(/[0-9]/g)
  phone_number: string;

  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}
