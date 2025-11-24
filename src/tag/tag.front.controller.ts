import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

import { TagService } from '@/tag/tag.service';
import { FormattedDateInterceptor } from '@/common/interceptors/formatted-date.interceptor';

@Controller('front/tag')
export class TagFrontController {
  constructor(private readonly tagService: TagService) {}

  // 获取所有标签列表 以及标签下的文章数量
  @Get('getAllTags')
  findAll() {
    return this.tagService.getAllTags();
  }

  @Get('getTagInfo/:id')
  @UseInterceptors(FormattedDateInterceptor)
  getTagInfo(@Param('id') id: string) {
    return this.tagService.getTagInfo(id);
  }
}
