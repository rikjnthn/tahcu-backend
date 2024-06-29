import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGroupDto {
  @IsString({ message: 'group description should be string' })
  @IsOptional()
  @MaxLength(600, {
    each: true,
    message: 'name should contain a maximum of 600 letters',
  })
  description?: string;

  @IsString({ message: 'group name should be string' })
  @IsNotEmpty({ message: 'group name should not be empty' })
  @MaxLength(30, {
    each: true,
    message: 'name should contain a maximum of 30 letters',
  })
  name: string;

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
