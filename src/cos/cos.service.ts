import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import COS from 'cos-nodejs-sdk-v5';

import { ConfigEnum } from '@/enum/config.enum';

@Injectable()
export class CosService {
  private cos: COS;
  private readonly bucket: string;
  private readonly region: string;
  constructor(private readonly configService: ConfigService) {
    this.cos = new COS({
      SecretId: this.configService.get<string>(ConfigEnum.COS_SECRET_ID),
      SecretKey: this.configService.get<string>(ConfigEnum.COS_SECRET_KEY),
    });
    this.bucket = this.configService.get<string>(ConfigEnum.COS_BUCKET);
    this.region = this.configService.get<string>(ConfigEnum.COS_REGION);
  }

  async uploadFile(key: string, file: Buffer | string) {
    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: file,
        },
        (err, data) => {
          if (err)
            return reject(
              err instanceof Error ? err : new Error(JSON.stringify(err)),
            );
          resolve(data);
        },
      );
    });
  }

  getPublicUrl(key: string) {
    return `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
  }
}
