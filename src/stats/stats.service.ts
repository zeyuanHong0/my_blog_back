import { Injectable } from '@nestjs/common';
import { BlogService } from '@/blog/blog.service';
import { TagService } from '@/tag/tag.service';
import { CategoryService } from '@/category/category.service';
import type { JwtPayload } from '@/auth/types/jwt-payload.type';

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

  async getDashboardStats(user: JwtPayload) {
    const [
      allBlogCount,
      publishedBlogCount,
      tagCount,
      categoryCount,
      weeklyAddedBlogCount,
      blogPublishTrend,
      categoryDistribution,
      tagDistribution,
    ] = await Promise.all([
      this.blogService.getAllBlogCount(user),
      this.blogService.getPublishedBlogCount(user),
      this.tagService.getTagCount(),
      this.categoryService.getCategoryCount(),
      this.blogService.getWeeklyAddedBlogCount(user),
      this.blogService.getLast7DaysBlogPublishTrend(user),
      this.blogService.getCategoryDistribution(user),
      this.blogService.getTop5Tags(user),
    ]);
    return {
      data: {
        allBlogCount: allBlogCount.data,
        publishedBlogCount: publishedBlogCount.data,
        tagCount: tagCount.data,
        categoryCount: categoryCount.data,
        weeklyAddedBlogCount: weeklyAddedBlogCount.data,
        blogPublishTrend: blogPublishTrend.data,
        categoryDistribution: categoryDistribution.data,
        tagDistribution: tagDistribution.data,
      },
    };
  }
}
