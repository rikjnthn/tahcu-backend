import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class FindGroupMessageDto {
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  skip: number;
}
