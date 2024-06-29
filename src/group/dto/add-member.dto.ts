import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @IsArray({ message: 'members should be array' })
  @IsString({
    each: true,
    message: 'member id should be string',
  })
  @IsNotEmpty({
    each: true,
    message: 'member id should not be empty',
  })
  @ArrayNotEmpty({ message: 'members should not be empty' })
  @MinLength(4, {
    each: true,
    message: 'member id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    each: true,
    message: 'member id should contain a maximum of 20 letters',
  })
  members: string[];
}
