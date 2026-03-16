import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { Category } from '@/category/entities/category.entity';
import { Tag } from '@/tag/entities/tag.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type TagRow = {
  tag_id: string;
  tag_name: string;
  blog_id: string;
};

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: {
        name: createCategoryDto.name,
      },
    });
    if (!category) {
      return await this.categoryRepository.save(createCategoryDto);
    } else {
      throw new Error('分类已存在');
    }
  }

  async findAll() {
    const categoryList = await this.categoryRepository.find({
      where: {
        is_delete: 0,
      },
      select: ['id', 'name'],
    });
    return {
      data: categoryList,
    };
  }

  async findByPage(name: string, pageNum: number, pageSize: number) {
    const [categoryList, total] = await this.categoryRepository.findAndCount({
      where: {
        is_delete: 0,
        name: name ? Like(`%${name}%`) : undefined,
      },
      select: ['id', 'name', 'createTime', 'updateTime'],
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: {
        createTime: 'DESC',
      },
    });
    return {
      data: {
        list: categoryList,
        total,
        pageNum: Number(pageNum),
        pageSize: Number(pageSize),
      },
    };
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'name', 'createTime', 'updateTime'],
    });
    return {
      data: category,
    };
  }

  async update(updateCategoryDto: UpdateCategoryDto) {
    const { id, ...rest } = updateCategoryDto;
    await this.categoryRepository.update(id, rest);
  }

  async remove(id: string) {
    await this.categoryRepository.update(id, { is_delete: 1 });
  }

  async getAllCategoryList() {
    const categoryList = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.is_delete = :is_delete', { is_delete: 0 })
      .select(['category.id', 'category.name'])
      .loadRelationCountAndMap(
        'category.blogCount',
        'category.blogs',
        'blog',
        (qb) =>
          qb.where(
            'blog.is_delete = :is_delete AND blog.published = :published',
            { is_delete: 0, published: 1 },
          ),
      )
      .getMany();
    return {
      data: {
        list: categoryList,
      },
    };
  }

  async getCategoryInfo(id: string) {
    // 先查分类和 blogs
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect(
        'category.blogs',
        'blogs',
        'blogs.is_delete = :is_delete AND blogs.published = :published',
        {
          is_delete: 0,
          published: 1,
        },
      )
      .where('category.id = :id', { id })
      .select([
        'category.id',
        'category.name',
        'blogs.id',
        'blogs.title',
        'blogs.description',
        'blogs.createTime',
        'blogs.updateTime',
      ])
      .getOne();

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (!category?.blogs?.length) {
      return {
        data: category,
      };
    }
    // 查询 tags
    const blogIds = category.blogs.map((blog) => blog.id);
    const tagRows = await this.tagRepository
      .createQueryBuilder('tag')
      .innerJoin('tag.blogs', 'blog', 'blog.id IN (:...blogIds)', { blogIds })
      .where('tag.is_delete = :is_delete', { is_delete: 0 })
      .select(['tag.id', 'tag.name', 'blog.id'])
      .getRawMany<TagRow>();
    // 组装 tags 数据结构
    const blogTagMap = new Map<string, { id: string; name: string }[]>();
    for (const row of tagRows) {
      const list = blogTagMap.get(row.blog_id) ?? [];
      list.push({
        id: row.tag_id,
        name: row.tag_name,
      });
      blogTagMap.set(row.blog_id, list);
    }

    for (const blog of category.blogs) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (blog as any).tags = blogTagMap.get(blog.id) ?? [];
    }
    return {
      data: category,
    };
  }

  //**************************************小程序相关************************************

  async getCategoryCount() {
    const categoryCount = await this.categoryRepository.count({
      where: {
        is_delete: 0,
      },
    });
    return {
      data: categoryCount,
    };
  }

  async getMiniAppAllCategoryList() {
    const categoryList = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.is_delete = :is_delete', { is_delete: 0 })
      .select(['category.id', 'category.name'])
      .loadRelationCountAndMap(
        'category.blogCount',
        'category.blogs',
        'blog',
        (qb) =>
          qb.where(
            'blog.is_delete = :is_delete AND blog.published = :published',
            { is_delete: 0, published: 1 },
          ),
      )
      .getMany();
    return {
      data: {
        list: categoryList,
      },
    };
  }

  async getMiniAppCategoryInfo(id: string) {
    // 先查分类和 blogs
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect(
        'category.blogs',
        'blogs',
        'blogs.is_delete = :is_delete AND blogs.published = :published',
        {
          is_delete: 0,
          published: 1,
        },
      )
      .where('category.id = :id', { id })
      .select([
        'category.id',
        'category.name',
        'blogs.id',
        'blogs.title',
        'blogs.description',
        'blogs.createTime',
        'blogs.updateTime',
      ])
      .getOne();

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (!category?.blogs?.length) {
      return {
        data: category,
      };
    }
    // 查询 tags
    const blogIds = category.blogs.map((blog) => blog.id);
    const tagRows = await this.tagRepository
      .createQueryBuilder('tag')
      .innerJoin('tag.blogs', 'blog', 'blog.id IN (:...blogIds)', { blogIds })
      .where('tag.is_delete = :is_delete', { is_delete: 0 })
      .select(['tag.id', 'tag.name', 'blog.id'])
      .getRawMany<TagRow>();
    // 组装 tags 数据结构
    const blogTagMap = new Map<string, { id: string; name: string }[]>();
    for (const row of tagRows) {
      const list = blogTagMap.get(row.blog_id) ?? [];
      list.push({
        id: row.tag_id,
        name: row.tag_name,
      });
      blogTagMap.set(row.blog_id, list);
    }

    for (const blog of category.blogs) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (blog as any).tags = blogTagMap.get(blog.id) ?? [];
    }

    return {
      data: category,
    };
  }
}
