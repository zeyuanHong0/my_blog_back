import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    await this.tagRepository.save(createTagDto);
    return {
      code: 200,
      msg: '操作成功',
    };
  }

  async findAll() {
    const tagList = await this.tagRepository.find({
      where: {
        is_delete: 0,
      },
      select: ['id', 'name'],
    });
    return {
      code: 200,
      msg: '操作成功',
      data: tagList,
    };
  }

  async findOne(id: string) {
    const tag = await this.tagRepository.findOne({
      where: { id, is_delete: 0 },
      select: ['id', 'name', 'icon', 'createTime', 'updateTime'],
    });
    return {
      code: 200,
      msg: '操作成功',
      data: tag,
    };
  }

  async update(updateTagDto: UpdateTagDto) {
    const { id, ...rest } = updateTagDto;
    await this.tagRepository.update(id, rest);
    return {
      code: 200,
      msg: '操作成功',
    };
  }

  async remove(id: string) {
    await this.tagRepository.update(id, { is_delete: 1 });
    return {
      code: 200,
      msg: '操作成功',
    };
  }
}
