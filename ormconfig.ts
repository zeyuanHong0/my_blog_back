import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { ConfigEnum } from './src/enum/config.enum';

import { User } from './src/user/entities/user.entity';
import { Blog } from './src/blog/entities/blog.entity';
import { Tag } from './src/tag/entities/tag.entity';

// 通过环境变量读取不同的.env文件
function getEnv(env: string): Record<string, any> {
  if (fs.existsSync(env)) {
    return dotenv.parse(fs.readFileSync(env));
  }
  return {};
}
// 通过dotenv解析.env文件
function buildConnectionOptions(): TypeOrmModuleOptions {
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${process.env.NODE_ENV || 'development'}`);
  const env = { ...defaultConfig, ...envConfig };
  return {
    type: 'mysql',
    timezone: '+08:00',
    host: env[ConfigEnum.DB_HOST],
    port: Number(env[ConfigEnum.DB_PORT]),
    username: env[ConfigEnum.DB_USERNAME],
    password: env[ConfigEnum.DB_PASSWORD],
    database: env[ConfigEnum.DB_NAME],
    entities: [User, Blog, Tag],
    synchronize: false, // 注意：在生产环境中不要使用 synchronize: true
  };
}

export const connectionParams = buildConnectionOptions();

export default new DataSource({
  ...connectionParams,
  migrations: [],
  subscribers: [],
} as DataSourceOptions);
