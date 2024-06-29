import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SendOTPDto {
  @IsEmail(undefined, { message: 'email is not valid' })
  @IsNotEmpty({ message: 'email should not be empty' })
  email: string;

  @IsString({ message: 'user id should be a string' })
  @MinLength(4, {
    message: 'user id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    message: 'user id should contain a maximum of 20 letters',
  })
  @IsOptional()
  user_id?: string;
}
