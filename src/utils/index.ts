import { extname } from 'path';
import type { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from '@/enum/config.enum';

/**
 * 上传的文件名称(时间戳 + 随机数 + 文件后缀)
 * @param file
 */
export const getFileName = (file: Express.Multer.File) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  return `${uniqueSuffix}${ext}`;
};

/**
 * 获取 axios 请求配置（包含代理配置）
 * @param configService
 * @param headers
 */
export const getAxiosConfig = (
  configService: ConfigService,
  headers: Record<string, string> = {},
): AxiosRequestConfig => {
  const requestConfig: AxiosRequestConfig = {
    headers: {
      Accept: 'application/json',
      ...headers,
    },
    timeout: 10000,
  };

  const proxyHost = configService.get(ConfigEnum.HTTP_PROXY_HOST);
  const proxyPort = configService.get(ConfigEnum.HTTP_PROXY_PORT);

  if (process.env.NODE_ENV === 'development' && proxyHost && proxyPort) {
    requestConfig.proxy = {
      host: proxyHost,
      port: parseInt(proxyPort as string),
      protocol: 'http',
    };
  }

  return requestConfig;
};
