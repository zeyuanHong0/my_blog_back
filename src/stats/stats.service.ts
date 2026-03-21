import { Injectable } from '@nestjs/common';
import { BlogService } from '@/blog/blog.service';
import { TagService } from '@/tag/tag.service';
import { CategoryService } from '@/category/category.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly blogService: BlogService,
    private readonly tagService: TagService,
    private readonly categoryService: CategoryService,
  ) {}

  async getBlogStats() {
    await Promise.all([
      this.blogService.getBlogCount(),
      this.tagService.getTagCount(),
      this.categoryService.getCategoryCount(),
    ]);

    return {};
  }
}
