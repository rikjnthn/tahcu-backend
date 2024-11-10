import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CreateGroupDto } from './create-group.dto';

export class UpdateGroupDto extends PickType(PartialType(CreateGroupDto), [
  'description',
  'name',
]) {
  @IsString({ message: 'new admin should be string' })
  @MinLength(4, {
    message: 'new admin id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    message: 'new admin id should contain a maximum of 20 letters',
  })
  @IsOptional()
  new_admin?: string;
}
