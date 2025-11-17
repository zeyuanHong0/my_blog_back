import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  UseGuards,
  Put,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { FormattedDateInterceptor } from '@/common/interceptors/formatted-date.interceptor';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@UseGuards(JwtAuthGuard)
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('createTag')
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get('getAllTagList')
  findAll() {
    return this.tagService.findAll();
  }

  @Get('getTagListByPage')
  @UseInterceptors(FormattedDateInterceptor)
  findByPage(
    @Query('name') name: string,
    @Query('pageNum') pageNum: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.tagService.findByPage(name, pageNum, pageSize);
  }

  @Get('getTagInfo/:id')
  @UseInterceptors(FormattedDateInterceptor)
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Put('updateTag')
  update(@Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(updateTagDto);
  }

  @Delete('deleteTag/:id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}
