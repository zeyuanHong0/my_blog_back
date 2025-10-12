import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsUUID } from 'class-validator';
import { CreateBlogDto } from './create-blog.dto';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
