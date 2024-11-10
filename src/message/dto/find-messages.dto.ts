import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateMessageDto } from './create-message.dto';

export class FindMessageDto extends PickType(PartialType(CreateMessageDto), [
  'contact_id',
  'group_id',
]) {
  @IsNumber(undefined, { message: 'skip should be a number' })
  @IsNotEmpty({ message: 'skip should not be empty' })
  skip: number;
}
