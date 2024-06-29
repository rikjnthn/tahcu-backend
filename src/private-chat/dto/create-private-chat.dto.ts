import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePrivateChatDto {
  @IsString({ message: 'user id should be a string' })
  @IsNotEmpty({ message: 'user id should not be empty' })
  @MinLength(4, {
    message: 'user id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    message: 'user id should contain a maximum of 20 letters',
  })
  user_id: string;

  @IsString({ message: 'friends id should be a string' })
  @IsNotEmpty({ message: 'friends id should not be empty' })
  @MinLength(4, {
    message: 'friends id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    message: 'friends id should contain a maximum of 20 letters',
  })
  friends_id: string;
}
