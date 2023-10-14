import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGroupMessageDto {
  @IsString()
  @IsNotEmpty()
  message_id: string;

  @IsString()
  @IsNotEmpty()
  group_id: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
