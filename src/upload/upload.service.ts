import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { File } from './entities/upload.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async saveFileRecord(
    file: Express.Multer.File,
    storageType: 'local' | 'cos',
    fileUrl?: string,
  ) {
    const { originalname, filename, mimetype, size } = file;
    const fileRecord = this.fileRepository.create({
      originalName: originalname,
      filename,
      mimetype,
      size,
      storageType,
      fileUrl,
    });
    const res = await this.fileRepository.save(fileRecord);
    console.log('saveFileRecord', res);
    return fileRecord;
  }
}
