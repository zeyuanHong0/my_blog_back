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

  async findOne(id: string) {
    const blog = await this.blogRepository.findOne({
      where: { id, is_delete: 0 },
      relations: ['createUser', 'tags'],
    });
    if (!blog) {
      throw new NotFoundException('博客不存在');
    }
    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const { tagIds, ...blogData } = updateBlogDto;

    const blog = await this.findOne(id);

    // 更新博客基本信息
    Object.assign(blog, blogData);

    // 如果有标签 ID，更新标签关联
    if (tagIds !== undefined) {
      if (tagIds.length > 0) {
        const tags = await this.tagRepository.find({
          where: { id: In(tagIds) },
        });
        blog.tags = tags;
      } else {
        blog.tags = [];
      }
    }

    return await this.blogRepository.save(blog);
  }

  async remove(id: string) {
    const blog = await this.findOne(id);
    blog.is_delete = 1;
    await this.blogRepository.save(blog);
  }
}
