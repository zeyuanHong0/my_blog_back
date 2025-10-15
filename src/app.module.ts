import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// eslint-disable-next-line import/no-unresolved
import { ServeStaticModule } from '@nestjs/serve-static';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigEnum } from './enum/config.enum';
import { connectionParams } from '../ormconfig';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { TagModule } from './tag/tag.module';
import { UploadModule } from './upload/upload.module';

// console.log('NODE_ENV:', process.env.NODE_ENV);
const envFilePath = `.env.${process.env.NODE_ENV || 'development'}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envFilePath],
      load: [
        () => {
          const result = dotenv.config({ path: '.env' });
          return result.parsed || {}; // 返回解析后的配置对象
        },
      ],
      validationSchema: Joi.object({
        [ConfigEnum.NODE_ENV]: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        [ConfigEnum.DB_PORT]: Joi.number().default(3306),
        [ConfigEnum.DB_HOST]: Joi.string().default('localhost'),
        [ConfigEnum.DB_USERNAME]: Joi.string().default('root'),
        [ConfigEnum.DB_PASSWORD]: Joi.string().default(''),
        [ConfigEnum.DB_NAME]: Joi.string().default('test_db'),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'files'),
      serveRoot: '/files',
    }),
    TypeOrmModule.forRoot(connectionParams),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                },
              }
            : {
                target: 'pino-roll',
                options: {
                  file: join('logs', 'log'),
                  frequency: 'daily',
                  size: '10M',
                  mkdir: true,
                },
              },
      },
    }),
    UserModule,
    AuthModule,
    BlogModule,
    TagModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
