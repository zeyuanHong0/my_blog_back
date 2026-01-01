import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

import { CategoryService } from './category.service';
import { FormattedDateInterceptor } from '@/common/interceptors/formatted-date.interceptor';

@Controller('front/category')
export class CategoryFrontController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('getAllCategoryList')
  @UseInterceptors(FormattedDateInterceptor)
  findByPage() {
    return this.categoryService.getAllCategoryList();
  }

  @Get('getCategoryInfo/:id')
  @UseInterceptors(FormattedDateInterceptor)
  findOne(@Param('id') id: string) {
    return this.categoryService.getCategoryInfo(id);
  }
}
