import { Controller, Get } from '@nestjs/common';

import { BlogService } from './blog.service';

@Controller('front/blog')
export class BlogFrontController {
  constructor(private readonly blogService: BlogService) {}

  @Get('getAllBlogs')
  findAll() {
    return this.blogService.findAll();
  }
}
