import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsNotEmpty({
    each: true,
  })
  @ArrayNotEmpty()
  members: string[];
}
