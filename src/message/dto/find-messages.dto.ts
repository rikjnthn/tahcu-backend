import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class FindMessageDto {
  @IsString()
  @IsNotEmpty()
  sender_id: string;

  @IsString()
  @IsNotEmpty()
  receiver_id: string;

  @IsDate()
  @IsNotEmpty()
  uppper_limit: Date;

  @IsDate()
  @IsNotEmpty()
  lower_limit: Date;
}
