import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogFrontController } from './blog.front.controller';
import { Blog } from './entities/blog.entity';
import { Tag } from '@/tag/entities/tag.entity';
import { User } from '@/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, Tag, User])],
  controllers: [BlogController, BlogFrontController],
  providers: [BlogService],
})
export class BlogModule {}
