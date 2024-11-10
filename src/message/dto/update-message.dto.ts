import { PickType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMessageDto extends PickType(CreateMessageDto, ['message']) {
  @IsString({ message: 'message id should be a string' })
  @IsNotEmpty({ message: 'message id should not be empty' })
  id: string;
}
