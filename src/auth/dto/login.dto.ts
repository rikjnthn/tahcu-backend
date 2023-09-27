import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  user_idOrEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
