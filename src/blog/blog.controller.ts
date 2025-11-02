import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
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

  @Get('getBlogListByPage')
  findByPage(
    @Query('title') title: string,
    @Query('pageNum') pageNum: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.blogService.findByPage(title, pageNum, pageSize);
  }

  @Get('getBlogInfo/:id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Put('updateBlog')
  update(@Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(updateBlogDto);
  }

  @Delete('deleteBlog/:id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
