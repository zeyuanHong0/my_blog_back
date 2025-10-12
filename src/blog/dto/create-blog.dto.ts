import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  createUser: string;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
