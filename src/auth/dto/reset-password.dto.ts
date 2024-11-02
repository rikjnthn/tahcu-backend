import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail(undefined, { message: 'email is not valid' })
  @IsNotEmpty({ message: 'email should not be empty' })
  email: string;

  @IsString({ message: 'otp should be string' })
  @IsNotEmpty({ message: 'otp should not be empty' })
  otp: string;

  @IsString({ message: 'password should be a string' })
  @MinLength(8, {
    message: 'password should contain a minimum of 8 letters',
  })
  @MaxLength(64, {
    message: 'password should contain a maximum of 64 letters',
  })
  @IsNotEmpty({ message: 'password should not be empty' })
  password: string;
}
