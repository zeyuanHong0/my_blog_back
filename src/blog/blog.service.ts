import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { Tag } from '../tag/entities/tag.entity';
import { User } from '../user/entities/user.entity';

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

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const { tagIds, createUser, ...blogData } = createBlogDto;

    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: createUser },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 创建博客实例
    const blog = this.blogRepository.create({
      ...blogData,
      createUser: user,
    });

    // 如果有标签 ID，查找并关联标签
    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagRepository.find({
        where: { id: In(tagIds) },
      });
      blog.tags = tags;
    }

    return await this.blogRepository.save(blog);
  }

  async findAll(): Promise<Blog[]> {
    return await this.blogRepository.find({
      relations: ['createUser', 'tags'],
      where: { is_delete: 0 },
    });
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id, is_delete: 0 },
      relations: ['createUser', 'tags'],
    });
    if (!blog) {
      throw new NotFoundException('博客不存在');
    }
    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
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

  async remove(id: string): Promise<void> {
    const blog = await this.findOne(id);
    blog.is_delete = 1;
    await this.blogRepository.save(blog);
  }
}
