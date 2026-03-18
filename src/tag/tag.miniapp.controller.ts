import { Controller, Get, Param } from '@nestjs/common';

import { TagService } from '@/tag/tag.service';

@Controller('miniapp/tag')
export class TagMiniAppController {
  constructor(private readonly tagService: TagService) {}

  // 获取所有标签数量
  @Get('getTagCount')
  getTagCount() {
    return this.tagService.getTagCount();
  }

  // 获取所有标签列表 以及标签下的文章数量
  @Get('getAllTags')
  findAll() {
    return this.tagService.getMiniAppAllTags();
  }

  @Get('getTagInfo/:id')
  getTagInfo(@Param('id') id: string) {
    return this.tagService.getTagInfo(id);
  }
}
