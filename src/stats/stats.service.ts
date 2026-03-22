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
    const [blogCount, tagCount, categoryCount] = await Promise.all([
      this.blogService.getBlogCount(),
      this.tagService.getTagCount(),
      this.categoryService.getCategoryCount(),
    ]);

    return {
      data: {
        blogCount: blogCount.data,
        tagCount: tagCount.data,
        categoryCount: categoryCount.data,
      },
    };
  }
}
