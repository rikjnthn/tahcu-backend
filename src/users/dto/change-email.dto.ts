import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangeEmailDto {
  @IsNotEmpty({ message: 'email should not be empty' })
  @IsEmail(undefined, { message: 'email is not valid' })
  email: string;

  @IsNotEmpty({ message: 'otp should not be empty' })
  @IsString({ message: 'otp should be a string' })
  @Length(4, 4, { message: 'otp is not valid' })
  otp: string;
}
