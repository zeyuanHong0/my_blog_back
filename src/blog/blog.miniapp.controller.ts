import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { BlogService } from './blog.service';

@Controller('miniapp/blog')
export class BlogMiniAppController {
  constructor(private readonly blogService: BlogService) {}

  // 获取最新的博客列表
  @Get('getLatestBlogList')
  findAll(@Query('num', ParseIntPipe) num: number) {
    return this.blogService.getLatestBlogList(num);
  }

  // 获取目前的所有博客数量
  @Get('getBlogCount')
  getBlogCount() {
    return this.blogService.getBlogCount();
  }

  @Get('getBlogInfo/:id')
  findOne(@Param('id') id: string) {
    return this.blogService.getFrontInfo(id);
  }
}
