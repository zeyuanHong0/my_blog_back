import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { StatusGateway } from './status.gateway';
import { Status } from '@/status/entities/status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Status])],
  controllers: [StatusController],
  providers: [StatusService, StatusGateway],
})
export class StatusModule {}
