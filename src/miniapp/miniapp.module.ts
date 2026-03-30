import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappService } from './miniapp.service';
import { MiniappController } from './miniapp.controller';
import { HttpModule } from '@nestjs/axios';
import { WxUser } from '@/miniapp/entities/wx-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WxUser]), HttpModule],
  controllers: [MiniappController],
  providers: [MiniappService],
})
export class MiniappModule {}
