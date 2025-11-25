import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Request } from 'express';

import { getFileName } from '@/utils';
import { UploadService } from './upload.service';
import { CosService } from '@/cos/cos.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly cosService: CosService,
  ) {}

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'files'), // 存储目录
        filename: (req, file, callback) => {
          callback(null, getFileName(file));
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 限制 5MB
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    console.log('uploadFile', file);
    const fileRecord = await this.uploadService.saveFileRecord(file, 'local');
    const host = `${req.protocol}://${req.get('host')}`;
    const data = {
      fileUrl: `${host}/files/${file.filename}`,
      ...fileRecord,
    };
    return {
      message: '上传成功',
      data,
    };
  }

  /**
   * 上传文件到腾讯云 COS
   */
  @Post('fileToCos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        filename: (req, file, callback) => {
          callback(null, getFileName(file));
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 限制 50MB
    }),
  )
  async uploadFileToCos(@UploadedFile() file: Express.Multer.File) {
    console.log('uploadFileToCos', file);
    const key = `uploads/${Date.now()}-${file.originalname}`;
    await this.cosService.uploadFileToCOS(key, file.buffer);
    const fileUrl = this.cosService.getPublicUrl(key);
    const fileRecord = await this.uploadService.saveFileRecord(
      file,
      'cos',
      fileUrl,
    );
    return {
      message: '上传成功',
      data: {
        fileUrl,
        ...fileRecord,
      },
    };
  }
}
