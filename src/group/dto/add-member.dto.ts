import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateGroupDto } from './create-group.dto';

export class AddMemberDto extends PickType(CreateGroupDto, ['members']) {
  @IsString({ message: 'group id should be string' })
  @IsNotEmpty({ message: 'group id should not be empty' })
  group_id: string;
}
