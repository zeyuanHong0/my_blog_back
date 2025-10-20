import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
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

  @Get('getTagInfo/:id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Post('updateTag')
  update(@Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(updateTagDto);
  }

  @Delete('deleteTag/:id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}
