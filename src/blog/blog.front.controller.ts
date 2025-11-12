import { Controller, Get, Param } from '@nestjs/common';

import { BlogService } from './blog.service';

@Controller('front/blog')
export class BlogFrontController {
  constructor(private readonly blogService: BlogService) {}

  @Get('getAllBlogs')
  findAll() {
    return this.blogService.findAll();
  }

  @Get('getBlogInfo/:id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }
}
