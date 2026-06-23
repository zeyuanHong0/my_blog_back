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
      this.blogService.getPublishedBlogCount(),
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

  async getDashboardStats() {
    const [
      allBlogCount,
      publishedBlogCount,
      tagCount,
      categoryCount,
      weeklyAddedBlogCount,
      blogPublishTrend,
    ] = await Promise.all([
      this.blogService.getAllBlogCount(),
      this.blogService.getPublishedBlogCount(),
      this.tagService.getTagCount(),
      this.categoryService.getCategoryCount(),
      this.blogService.getWeeklyAddedBlogCount(),
      this.blogService.getLast7DaysBlogPublishTrend(),
    ]);
    return {
      data: {
        allBlogCount: allBlogCount.data,
        publishedBlogCount: publishedBlogCount.data,
        tagCount: tagCount.data,
        categoryCount: categoryCount.data,
        weeklyAddedBlogCount: weeklyAddedBlogCount.data,
        blogPublishTrend: blogPublishTrend.data,
      },
    };
  }
}
