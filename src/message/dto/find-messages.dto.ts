import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class FindMessageDto {
  @IsString({ message: 'contact id should be a string' })
  @IsOptional()
  contact_id?: string;

  @IsString({ message: 'group id should be a string' })
  @IsOptional()
  group_id?: string;

  @IsNumber(undefined, { message: 'skip should be a number' })
  @IsNotEmpty({ message: 'skip should not be empty' })
  skip: number;
}
