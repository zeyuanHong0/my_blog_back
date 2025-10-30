import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { Tag } from '@/tag/entities/tag.entity';
import { User } from '@/user/entities/user.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createBlogDto: CreateBlogDto, userId: string) {
    const { tags, ...blogData } = createBlogDto;

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
      createUser: user,
    });

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
    return {
      code: 200,
      message: '博客创建成功',
    };
  }

  async findAll() {
    return await this.blogRepository.find({
      relations: ['createUser', 'tags'],
      where: { is_delete: 0 },
    });
  }

  async findByPage(title: string, pageNum: number, pageSize: number) {
    const queryBuilder = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.tags', 'tag')
      .select([
        'blog.id',
        'blog.title',
        'blog.published',
        'blog.createTime',
        'blog.updateTime',
        'tag.id',
        'tag.name',
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

    const [blogList, total] = await queryBuilder.getManyAndCount();

    return {
      code: 200,
      msg: '操作成功',
      data: {
        list: blogList,
        total,
        pageNum: Number(pageNum),
        pageSize: Number(pageSize),
      },
    };
  }

  async findOne(id: string) {
    const blog = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.tags', 'tags')
      .where('blog.id = :id', { id })
      .andWhere('blog.is_delete = 0')
      .select([
        'blog.id',
        'blog.title',
        'blog.description',
        'blog.published',
        'blog.content',
        'tags.id',
        'tags.name',
      ])
      .getOne();
    if (!blog) {
      throw new NotFoundException('博客不存在');
    }
    return {
      code: 200,
      message: '操作成功',
      data: blog,
    };
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {}

  async remove(id: string) {}
}
