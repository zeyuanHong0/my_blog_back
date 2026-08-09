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
import { FormattedDateInterceptor } from '@/common/interceptors/formatted-date.interceptor';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
// import { RolesGuard } from '@/auth/guards';
// import { Role } from '@/enum/role.enum';
// import { Roles } from '@/common/decorators/roles.decorator';

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
  @UseInterceptors(FormattedDateInterceptor)
  findByPage(
    @Query('title') title: string,
    @Query('pageNum') pageNum: number,
    @Query('pageSize') pageSize: number,
    @Query('searchCategoryId') searchCategoryId: string,
    @Query('searchTags') searchTags: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogService.findByPage(
      title,
      pageNum,
      pageSize,
      searchCategoryId,
      searchTags,
      user,
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
    return this.blogService.getInfo(id);
  }

  @Put('updateBlog')
  update(
    @Body() updateBlogDto: UpdateBlogDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogService.update(updateBlogDto, user);
  }

  @Post('changeBlogStatus/:id')
  changeStatus(
    @Param('id') id: string,
    @Body('published') published: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blogService.changeStatus(id, published, user);
  }

  @Delete('deleteBlog/:id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.blogService.remove(id, user);
  }
}
