import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { type JwtPayload } from '@/auth/types/jwt-payload.type';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@UseGuards(JwtAuthGuard)
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('createBlog')
  create(
    @Body() createBlogDto: CreateBlogDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogService.create(createBlogDto, user.id);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get('getBlogInfo/:id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Post('updateBlog')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete('deleteBlog/:id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
