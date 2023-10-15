import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteMemberDto {
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
  memberships: string[];
}
