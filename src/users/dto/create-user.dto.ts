import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'user id should be a string' })
  @IsNotEmpty({ message: 'user id should not be empty' })
  @MinLength(4, {
    message: 'user id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    message: 'user id should contain a maximum of 20 letters',
  })
  user_id: string;

  @IsString({ message: 'username should be a string' })
  @IsNotEmpty({ message: 'username should not be empty' })
  @MinLength(4, {
    message: 'username should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    message: 'username should contain a maximum of 20 letters',
  })
  username: string;

  @IsString({ message: 'password should be a string' })
  @IsNotEmpty({ message: 'password should not be empty' })
  @MinLength(8, {
    message: 'password should contain a minimum of 8 letters',
  })
  @MaxLength(64, {
    message: 'password should contain a maximum of 64 letters',
  })
  password: string;

  @IsEmail(undefined, { message: 'email not valid' })
  @IsNotEmpty({ message: 'email should not be empty' })
  email: string;
}
