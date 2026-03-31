import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MiniappService } from './miniapp.service';
import { MiniappController } from './miniapp.controller';
import { WxUser } from '@/miniapp/entities/wx-user.entity';
import { ConfigEnum } from '@/enum/config.enum';
import { MiniappJwtStrategy } from './miniapp-jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([WxUser]),
    HttpModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(ConfigEnum.JWT_SECRET),
        signOptions: { expiresIn: '86400' },
      }),
    }),
  ],
  controllers: [MiniappController],
  providers: [MiniappService, MiniappJwtStrategy],
})
export class MiniappModule {}
