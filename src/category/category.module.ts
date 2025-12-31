import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryFrontController } from '@/category/category.front.controller';
import { Category } from '@/category/entities/category.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController, CategoryFrontController],
  providers: [CategoryService],
})
export class CategoryModule {}
