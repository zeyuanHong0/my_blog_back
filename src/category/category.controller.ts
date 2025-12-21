import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  Put,
} from '@nestjs/common';

import { JwtAuthGuard, RolesGuard } from '@/auth/guards';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FormattedDateInterceptor } from '@/common/interceptors/formatted-date.interceptor';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/enum/role.enum';

// @UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('createCategory')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get('getAllCategoryList')
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('getCategoryListByPage')
  @UseInterceptors(FormattedDateInterceptor)
  findByPage(
    @Query('name') name: string,
    @Query('pageNum') pageNum: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.categoryService.findByPage(name, pageNum, pageSize);
  }

  @Get('getCategoryInfo/:id')
  @UseInterceptors(FormattedDateInterceptor)
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Put('updateCategory')
  update(@Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(updateCategoryDto);
  }

  @Delete('deleteCategory/:id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
