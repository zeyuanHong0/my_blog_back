import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { Category } from '@/category/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
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
    const categoryInfo = await this.categoryRepository
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
      .leftJoinAndSelect(
        'blogs.tags',
        'blog_tags',
        'blog_tags.is_delete = :is_delete',
        {
          is_delete: 0,
        },
      )
      .leftJoinAndSelect('blogs.category', 'blog_category')
      .where('category.id = :id', { id })
      .select([
        'category.id',
        'category.name',
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
      data: categoryInfo,
    };
  }
}
