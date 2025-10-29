import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

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

  @IsNotEmpty()
  published: number;

  @IsArray()
  @ArrayMinSize(1)
  tags: string[];
}
