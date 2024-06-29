import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteMessageDto {
  @IsArray({ message: 'ids should be an array' })
  @IsString({ each: true, message: 'id should be a string' })
  @IsNotEmpty({ each: true, message: 'id should not be empty' })
  ids: string[];
}
