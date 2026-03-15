import { Controller, Get, Param } from '@nestjs/common';

import { CategoryService } from './category.service';

@Controller('miniapp/category')
export class CategoryMiniAppController {
  constructor(private readonly categoryService: CategoryService) {}

  // 获取所有分类的数量
  @Get('getCategoryCount')
  getCategoryCount() {
    return this.categoryService.getCategoryCount();
  }

  @Get('getAllCategoryList')
  findByPage() {
    return this.categoryService.getMiniAppAllCategoryList();
  }

  @Get('getCategoryInfo/:id')
  findOne(@Param('id') id: string) {
    return this.categoryService.getMiniAppCategoryInfo(id);
  }
}
