import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class FindMessageDto {
  @IsString()
  @IsNotEmpty()
  sender_id: string;

  @IsString()
  @IsNotEmpty()
  receiver_id: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  lower_limit: number;
}
