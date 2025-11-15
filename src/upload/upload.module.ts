import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { File } from '@/upload/entities/upload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
