import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePrivateChatDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  friends_id: string;
}
