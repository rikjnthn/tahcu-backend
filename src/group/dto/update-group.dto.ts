import { IsString } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  description?: string;

  @IsString()
  name?: string;

  @IsString()
  new_admin?: string;
}
