import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { Tag } from '@/tag/entities/tag.entity';
import { User } from '@/user/entities/user.entity';
import { Category } from '@/category/entities/category.entity';
import { AiService } from '@/ai/ai.service';
import dayjs from '@/common/dayjs.config';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly aiService: AiService,
  ) {}

  async create(createBlogDto: CreateBlogDto, userId: string) {
    const { tags, category: categoryId, ...blogData } = createBlogDto;

    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 创建博客实例
    const blog = this.blogRepository.create({
      ...blogData,
      createUser: user.id,
    });

    // 如果有分类，查找并关联分类
    if (categoryId) {
      const findCategory = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!findCategory) {
        throw new NotFoundException('分类不存在');
      }
      blog.category = findCategory;
    }

    // 如果有标签，查找并关联标签
    if (tags && tags.length > 0) {
      const findTags = await this.tagRepository.find({
        where: { id: In(tags) },
      });
      if (findTags.length !== tags.length) {
        throw new NotFoundException('部分标签不存在');
      }
      blog.tags = findTags;
    }
    await this.blogRepository.save(blog);
    // AI总结
    this.generateAiSummaryAsync(blog.id, blog.content);
    return {
      message: '博客创建成功',
    };
  }

  async findAll() {
    const blogList = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.tags', 'tags')
      .leftJoinAndSelect('blog.category', 'category')
      .where('blog.is_delete = :isDelete', { isDelete: 0 })
      .andWhere('blog.published = :published', { published: 1 })
      .select([
        'blog.id',
        'blog.title',
        'blog.description',
        'blog.createTime',
        'tags.id',
        'tags.name',
        'tags.icon',
        'category.name',
      ])
      .orderBy('blog.createTime', 'DESC')
      .getMany();

    return {
      data: blogList,
    };
  }

  async findByPage(
    title: string,
    pageNum: number,
    pageSize: number,
    searchCategoryId: string,
    searchTags: string,
  ) {
    const queryBuilder = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.tags', 'tag')
      .leftJoinAndSelect('blog.category', 'category')
      .select([
        'blog.id',
        'blog.title',
        'blog.published',
        'blog.createTime',
        'blog.updateTime',
        'tag.id',
        'tag.name',
        'category.id',
        'category.name',
      ])
      .where('blog.is_delete = :isDelete', { isDelete: 0 })
      .orderBy('blog.createTime', 'DESC')
      .skip((pageNum - 1) * pageSize)
      .take(pageSize);

    // 如果有标题搜索条件
    if (title) {
      queryBuilder.andWhere('blog.title LIKE :title', {
        title: `%${title}%`,
      });
    }

    // 如果有分类搜索条件
    if (searchCategoryId) {
      queryBuilder.andWhere('category.id = :searchCategoryId', {
        searchCategoryId,
      });
    }

    // 如果有标签搜索条件（逗号分隔的字符串）
    if (searchTags) {
      const tagIds = searchTags.split(',').filter((id) => id.trim());
      if (tagIds.length > 0) {
        queryBuilder.andWhere('tag.id IN (:...tagIds)', { tagIds });
      }
    }

    const [blogList, total] = await queryBuilder.getManyAndCount();

    return {
      data: {
        list: blogList,
        total,
        pageNum: Number(pageNum),
        pageSize: Number(pageSize),
      },
    };
  }

  async getInfo(id: string) {
    const blog = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.tags', 'tags')
      .leftJoinAndSelect('blog.category', 'category')
      .where('blog.id = :id', { id })
      .select([
        'blog.id',
        'blog.title',
        'blog.description',
        'blog.content',
        'blog.published',
        'blog.aiSummary',
        'tags.id',
        'tags.name',
        'category.id',
        'category.name',
      ])
      .getOne();
    if (!blog) {
      throw new NotFoundException('博客不存在');
    }
    return {
      data: blog,
    };
  }

  async getFrontInfo(id: string) {
    const blog = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.tags', 'tags')
      .leftJoinAndSelect('blog.category', 'category')
      .where('blog.id = :id', { id })
      .andWhere('blog.is_delete = 0 AND blog.published = 1')
      .select([
        'blog.id',
        'blog.title',
        'blog.description',
        'blog.content',
        'blog.aiSummary',
        'blog.createTime',
        'blog.updateTime',
        'tags.id',
        'tags.name',
        'tags.icon',
        'tags.icon_dark',
        'category.id',
        'category.name',
      ])
      .getOne();
    if (!blog) {
      throw new NotFoundException('博客不存在');
    }
    return {
      data: blog,
    };
  }

  async getArchives() {
    const archivesList = await this.blogRepository.find({
      where: {
        is_delete: 0,
        published: 1,
      },
      select: ['id', 'title', 'createTime'],
      order: {
        createTime: 'DESC',
      },
    });
    return {
      data: archivesList,
    };
  }

  async update(updateBlogDto: UpdateBlogDto) {
    const {
      id,
      category: categoryId,
      tags: tagIds = [],
      aiSummary,
      ...blogData
    } = updateBlogDto;
    const blog = await this.blogRepository.findOne({
      where: { id, is_delete: 0 },
      relations: ['tags'],
    });
    if (!blog) {
      throw new NotFoundException('博客不存在');
    }
    // 查找分类
    const findCategory = await this.categoryRepository.findOne({
      where: { id: categoryId, is_delete: 0 },
    });
    if (!findCategory) {
      throw new NotFoundException('分类不存在');
    }
    blog.category = findCategory;
    // 查出新的标签集合
    const newTags = await this.tagRepository.find({
      where: { id: In(tagIds) },
    });
    if (newTags.length !== tagIds.length) {
      throw new NotFoundException('部分标签不存在');
    }
    blog.tags = newTags;
    // 更新其他字段
    Object.assign(blog, blogData, { aiSummary });
    await this.blogRepository.save(blog);
    if (!aiSummary.trim()) {
      // 如果AI总结是空的，更新博客AI总结
      this.generateAiSummaryAsync(id, blog.content);
    }
    return {
      message: '博客更新成功',
    };
  }

  private generateAiSummaryAsync(blogId: string, content: string) {
    this.aiService
      .summarizeBlog(content)
      .then(async (summary) => {
        await this.blogRepository.update(blogId, { aiSummary: summary });
        console.log(`AI 总结生成成功 [blogId: ${blogId}]`);
      })
      .catch((error) => {
        console.error(`AI 总结生成失败 [blogId: ${blogId}]:`, error);
      });
  }

  async changeStatus(id: string, published: number) {
    const blog = await this.blogRepository.findOne({
      where: { id, is_delete: 0 },
    });
    if (!blog) {
      throw new NotFoundException('博客不存在');
    }
    blog.published = published;
    await this.blogRepository.save(blog);
    return {
      message: '博客状态更新成功',
    };
  }

  async remove(id: string) {
    await this.blogRepository.update(id, { is_delete: 1 });
    return {
      message: '博客删除成功',
    };
  }

  // 获取已发布博客数量
  async getPublishedBlogCount() {
    const blogCount = await this.blogRepository.count({
      where: { is_delete: 0, published: 1 },
    });
    return {
      data: blogCount,
    };
  }

  // 获取博客总数
  async getAllBlogCount() {
    const blogCount = await this.blogRepository.count({
      where: { is_delete: 0 },
    });
    return {
      data: blogCount,
    };
  }

  // 获取本周新增文章数（与上周环比）
  async getWeeklyAddedBlogCount() {
    const currentWeekStart = dayjs().startOf('isoWeek').startOf('day');
    const currentWeekEnd = currentWeekStart.add(1, 'week');
    const lastWeekStart = currentWeekStart.subtract(1, 'week');
    const countBlogsByRange = (start: Date, end: Date) =>
      this.blogRepository
        .createQueryBuilder('blog')
        .where('blog.is_delete = :isDelete', { isDelete: 0 })
        .andWhere('blog.published = :published', { published: 1 })
        .andWhere('blog.createTime >= :start')
        .andWhere('blog.createTime < :end')
        .setParameters({ start, end })
        .getCount();

    const [currentWeekBlogCount, lastWeekBlogCount] = await Promise.all([
      countBlogsByRange(currentWeekStart.toDate(), currentWeekEnd.toDate()),
      countBlogsByRange(lastWeekStart.toDate(), currentWeekStart.toDate()),
    ]);

    const growthRate =
      lastWeekBlogCount === 0
        ? null
        : Number(
            (
              ((currentWeekBlogCount - lastWeekBlogCount) / lastWeekBlogCount) *
              100
            ).toFixed(2),
          );

    return {
      data: {
        currentWeekBlogCount,
        lastWeekBlogCount,
        growthRate,
      },
    };
  }

  // 近 7 天的发文趋势
  async getLast7DaysBlogPublishTrend() {
    const start = dayjs().subtract(6, 'day').startOf('day');
    const end = dayjs().endOf('day');
    const trendRaw = await this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.is_delete = :isDelete', { isDelete: 0 })
      .andWhere('blog.published = :published', { published: 1 })
      .andWhere('blog.createTime BETWEEN :start AND :end', {
        start: start.toDate(),
        end: end.toDate(),
      })
      .select("DATE_FORMAT(blog.createTime, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy("DATE_FORMAT(blog.createTime, '%Y-%m-%d')")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    const trendMap = new Map<string, number>(
      trendRaw.map((item) => [item.date, Number(item.count)]),
    );
    const trend = Array.from({ length: 7 }, (_, index) => {
      const date = start.add(index, 'day').format('YYYY-MM-DD');
      return {
        date,
        count: trendMap.get(date) ?? 0,
      };
    });
    const trendData = {
      dateList: trend.map((item) => item.date),
      data: trend.map((item) => item.count),
    };

    return {
      data: trendData,
    };
  }

  // ********************************小程序相关************************************

  async getLatestBlogList(num: number) {
    const blogList = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.tags', 'tags')
      .where('blog.is_delete = :isDelete', { isDelete: 0 })
      .andWhere('blog.published = :published', { published: 1 })
      .select([
        'blog.id',
        'blog.title',
        'blog.description',
        'blog.createTime',
        'tags.id',
        'tags.name',
      ])
      .orderBy('blog.createTime', 'DESC')
      .take(num)
      .getMany();

    return {
      data: blogList,
    };
  }

  async getMiniAppBlogList() {
    const blogList = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.tags', 'tags')
      .where('blog.is_delete = :isDelete', { isDelete: 0 })
      .andWhere('blog.published = :published', { published: 1 })
      .select([
        'blog.id',
        'blog.title',
        'blog.description',
        'blog.createTime',
        'tags.id',
        'tags.name',
      ])
      .orderBy('blog.createTime', 'DESC')
      .getMany();
    return {
      data: blogList,
    };
  }

  async getMiniAppBlogInfo(id: string) {
    const blog = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.tags', 'tags')
      .leftJoinAndSelect('blog.category', 'category')
      .where('blog.id = :id', { id })
      .andWhere('blog.is_delete = 0 AND blog.published = 1')
      .select([
        'blog.id',
        'blog.title',
        'blog.description',
        'blog.aiSummary',
        'blog.content',
        'blog.createTime',
        'blog.updateTime',
        'tags.id',
        'tags.name',
        'category.id',
        'category.name',
      ])
      .getOne();
    return {
      data: blog,
    };
  }
}
