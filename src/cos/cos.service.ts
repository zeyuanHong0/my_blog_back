import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import COS from 'cos-nodejs-sdk-v5';

import { ConfigEnum } from '@/enum/config.enum';

@Injectable()
export class CosService {
  private cos: COS | null = null;
  private bucket: string | null = null;
  private region: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  private initializeCos() {
    if (this.cos) return; // 已初始化则直接返回

    const secretId = this.configService.get<string>(ConfigEnum.COS_SECRET_ID);
    const secretKey = this.configService.get<string>(ConfigEnum.COS_SECRET_KEY);
    const bucket = this.configService.get<string>(ConfigEnum.COS_BUCKET);
    const region = this.configService.get<string>(ConfigEnum.COS_REGION);

    if (!secretId || !secretKey || !bucket || !region) {
      throw new Error(
        'COS configuration is incomplete. Please check environment variables: COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION',
      );
    }

    this.cos = new COS({
      SecretId: secretId,
      SecretKey: secretKey,
    });
    this.bucket = bucket;
    this.region = region;
  }

  async uploadFileToCOS(key: string, file: Buffer | string) {
    this.initializeCos();
    return new Promise((resolve, reject) => {
      this.cos!.putObject(
        {
          Bucket: this.bucket!,
          Region: this.region!,
          Key: key,
          Body: file,
        },
        (err: unknown, data) => {
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
    this.initializeCos();
    return `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
  }
}
