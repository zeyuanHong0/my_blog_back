import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryFrontController } from '@/category/category.front.controller';
import { CategoryMiniAppController } from './category.miniapp.controller';
import { Category } from '@/category/entities/category.entity';
import { Tag } from '@/tag/entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Tag])],
  controllers: [
    CategoryController,
    CategoryFrontController,
    CategoryMiniAppController,
  ],
  providers: [CategoryService],
})
export class CategoryModule {}
