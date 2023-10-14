import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupMessageDto {
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
