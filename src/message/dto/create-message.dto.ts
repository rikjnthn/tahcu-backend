import {
  isEmpty,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateMessageDto {
  @ValidateIf((o) => isEmpty(o.contact_id))
  @IsString({ message: 'group id should be a string' })
  group_id?: string;

  @ValidateIf((o) => isEmpty(o.group_id))
  @IsString({ message: 'contact id should be a string' })
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
