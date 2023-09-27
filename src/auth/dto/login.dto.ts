import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  idOrEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
