import { Module } from '@nestjs/common';
import { MiniappService } from './miniapp.service';
import { MiniappController } from './miniapp.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [MiniappController],
  providers: [MiniappService],
})
export class MiniappModule {}
