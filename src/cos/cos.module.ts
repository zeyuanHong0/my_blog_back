import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CosService } from './cos.service';

@Module({
  imports: [ConfigModule],
  providers: [CosService],
})
export class CosModule {}
