import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  group_id: string;

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
