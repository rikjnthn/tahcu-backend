import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'user id or email should be a string' })
  @IsNotEmpty({ message: 'user id or email should not be empty' })
  user_idOrEmail: string;

  @IsString({ message: 'password should be a string' })
  @IsNotEmpty({ message: 'password should not be empty' })
  @MinLength(8, {
    message: 'password should contain a minimum of 8 letters',
  })
  @MaxLength(64, {
    message: 'password should contain a maximum of 64 letters',
  })
  password: string;
}
