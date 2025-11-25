import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { File } from '@/upload/entities/upload.entity';
import { CosModule } from '@/cos/cos.module';
import { CosService } from '@/cos/cos.service';

@Module({
  imports: [TypeOrmModule.forFeature([File]), CosModule],
  controllers: [UploadController],
  providers: [UploadService, CosService],
})
export class UploadModule {}
