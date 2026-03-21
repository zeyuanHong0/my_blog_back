import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { BlogModule } from '@/blog/blog.module';
import { TagModule } from '@/tag/tag.module';
import { CategoryModule } from '@/category/category.module';

@Module({
  imports: [BlogModule, TagModule, CategoryModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
