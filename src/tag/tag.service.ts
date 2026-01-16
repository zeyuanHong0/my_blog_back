import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { Blog } from '@/blog/entities/blog.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    await this.tagRepository.save(createTagDto);
  }

  async findAll() {
    const tagList = await this.tagRepository.find({
      where: {
        is_delete: 0,
      },
      select: ['id', 'name'],
    });
    return {
      data: tagList,
    };
  }

  async getAllTags() {
    const tagList = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.blogs', 'blogs')
      .where('tag.is_delete = :is_delete', { is_delete: 0 })
      .select(['tag.id', 'tag.name', 'tag.icon'])
      .loadRelationCountAndMap('tag.blogCount', 'tag.blogs', 'blog', (qb) =>
        qb
          .where('blog.is_delete = :blog_is_delete', { blog_is_delete: 0 })
          .andWhere('blog.published = :published', { published: 1 }),
      )
      .getMany();
    return {
      data: tagList,
    };
  }

  async findByPage(name: string, pageNum: number, pageSize: number) {
    const [tagList, total] = await this.tagRepository.findAndCount({
      where: { is_delete: 0, name: name ? Like(`%${name}%`) : undefined },
      select: ['id', 'name', 'icon', 'createTime', 'updateTime'],
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: {
        createTime: 'DESC',
      },
    });
    return {
      data: {
        list: tagList,
        total,
        pageNum: Number(pageNum),
        pageSize: Number(pageSize),
      },
    };
  }

  async findOne(id: string) {
    const tag = await this.tagRepository.findOne({
      where: { id, is_delete: 0 },
      select: ['id', 'name', 'icon', 'createTime', 'updateTime'],
    });
    return {
      data: tag,
    };
  }

  async getTagInfo(id: string) {
    const tagInfo = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect(
        'tag.blogs',
        'blogs',
        'blogs.is_delete = :is_delete AND blogs.published = :published',
        {
          is_delete: 0,
          published: 1,
        },
      )
      .leftJoinAndSelect(
        'blogs.tags',
        'blog_tags',
        'blog_tags.is_delete = :is_delete',
        {
          is_delete: 0,
        },
      )
      .leftJoinAndSelect('blogs.category', 'blog_category')
      .where('tag.id = :id', { id })
      .select([
        'tag.id',
        'tag.name',
        'blogs.id',
        'blogs.title',
        'blogs.description',
        'blogs.createTime',
        'blogs.updateTime',
        'blog_tags.id',
        'blog_tags.icon',
        'blog_tags.name',
        'blog_category.name',
      ])
      .getOne();

    return {
      data: tagInfo,
    };
  }

  async update(updateTagDto: UpdateTagDto) {
    const { id, ...rest } = updateTagDto;
    await this.tagRepository.update(id, rest);
  }

  async remove(id: string) {
    await this.tagRepository.update(id, { is_delete: 1 });
  }
}
