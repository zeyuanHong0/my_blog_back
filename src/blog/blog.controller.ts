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
  UseInterceptors,
} from '@nestjs/common';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { type JwtPayload } from '@/auth/types/jwt-payload.type';
import { RolesGuard } from '@/auth/guards';
import { FormattedDateInterceptor } from '@/common/interceptors/formatted-date.interceptor';
import { Roles } from '@/common/decorators/roles.decorator';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Role } from '@/enum/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('createBlog')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  create(
    @Body() createBlogDto: CreateBlogDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogService.create(createBlogDto, user.id);
  }

  @Get('getBlogListByPage')
  @UseInterceptors(FormattedDateInterceptor)
  findByPage(
    @Query('title') title: string,
    @Query('pageNum') pageNum: number,
    @Query('pageSize') pageSize: number,
    @Query('searchCategoryId') searchCategoryId: string,
    @Query('searchTags') searchTags: string,
  ) {
    return this.blogService.findByPage(
      title,
      pageNum,
      pageSize,
      searchCategoryId,
      searchTags,
    );
  }

  @Get('getAllBlogs')
  @UseInterceptors(FormattedDateInterceptor)
  findAll() {
    return this.blogService.findAll();
  }

  @Get('getBlogInfo/:id')
  @UseInterceptors(FormattedDateInterceptor)
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Put('updateBlog')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  update(@Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(updateBlogDto);
  }

  @Post('changeBlogStatus/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  changeStatus(@Param('id') id: string, @Body('published') published: number) {
    return this.blogService.changeStatus(id, published);
  }

  @Delete('deleteBlog/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
