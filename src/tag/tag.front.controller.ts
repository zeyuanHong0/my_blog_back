import { Controller, Get } from '@nestjs/common';

import { TagService } from '@/tag/tag.service';

@Controller('front/tag')
export class TagFrontController {
  constructor(private readonly tagService: TagService) {}

  // 获取所有标签列表 以及标签下的文章数量
  @Get('getAllTags')
  findAll() {
    return this.tagService.getAllTags();
  }
}
