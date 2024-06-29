import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsString({ message: 'group id should be a string' })
  @IsOptional()
  group_id?: string;

  @IsString({ message: 'contact id should be a string' })
  @IsOptional()
  contact_id?: string;

  @IsString({ message: 'sender id should be a string' })
  @IsNotEmpty({ message: 'sender id should not be empty' })
  @MinLength(4, {
    message: 'sender id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    message: 'sender id should contain a maximum of 20 letters',
  })
  sender_id: string;

  @IsString({ message: 'message should be a string' })
  @IsNotEmpty({ message: 'message should not be empty' })
  message: string;
}
