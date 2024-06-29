import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class DeleteMemberDto {
  @IsString({ message: 'group id should be string' })
  @IsNotEmpty({ message: 'group id should not be empty' })
  group_id: string;

  @IsArray({ message: 'members should be in array' })
  @IsString({
    each: true,
    message: 'member id should be string',
  })
  @IsNotEmpty({
    each: true,
    message: 'member id should not be empty',
  })
  @MinLength(4, {
    each: true,
    message: 'member id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    each: true,
    message: 'member id should contain a maximum of 20 letters',
  })
  @ArrayNotEmpty({ message: 'members should not be empty' })
  members: string[];
}
