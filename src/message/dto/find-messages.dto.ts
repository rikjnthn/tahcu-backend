import { IsDate, IsOptional, IsString } from 'class-validator';

export class FindMessageDto {
  @IsString({ message: 'contact id should be a string' })
  @IsOptional()
  contact_id?: string;

  @IsString({ message: 'group id should be a string' })
  @IsOptional()
  group_id?: string;

  @IsDate({ message: 'data is not valid' })
  @IsOptional()
  date?: Date;
}
