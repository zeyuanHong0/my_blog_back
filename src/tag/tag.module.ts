import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { Tag } from './entities/tag.entity';
import { TagFrontController } from './tag.front.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagController, TagFrontController],
  providers: [TagService],
})
export class TagModule {}
