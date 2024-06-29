import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateGroupDto {
  @IsString({ message: 'group description should be string' })
  @IsOptional()
  @MaxLength(600, {
    each: true,
    message: 'name should contain a maximum of 600 letters',
  })
  description?: string;

  @IsString({ message: 'group name should be string' })
  @IsOptional()
  @MaxLength(30, {
    each: true,
    message: 'name should contain a maximum of 30 letters',
  })
  name?: string;

  @IsString({ message: 'new admin should be string' })
  @MinLength(4, {
    message: 'admin id should contain a minimum of 4 letters',
  })
  @MaxLength(20, {
    message: 'admin id should contain a maximum of 20 letters',
  })
  @IsOptional()
  new_admin?: string;
}
