import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'current password should be a string' })
  @IsNotEmpty({ message: 'current password should not be empty' })
  @MinLength(8, {
    message: 'current password should contain a minimum of 8 letters',
  })
  @MaxLength(64, {
    message: 'current password should contain a maximum of 64 letters',
  })
  current_password: string;

  @IsString({ message: 'new password should be a string' })
  @IsNotEmpty({ message: 'new password should not be empty' })
  @MinLength(8, {
    message: 'new password should contain a minimum of 8 letters',
  })
  @MaxLength(64, {
    message: 'new password should contain a maximum of 64 letters',
  })
  new_password: string;
}
