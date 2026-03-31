import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigEnum } from '@/enum/config.enum';
import { UpdateStatusDto } from '@/status/dto/update-status.dto';
import { Status } from '@/status/entities/status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    private readonly configService: ConfigService,
  ) {}

  // 更新状态
  async updateStatus(data: UpdateStatusDto) {
    const status = await this.statusRepository.findOne({
      where: {},
      order: {
        id: 'ASC',
      },
    });
    await this.statusRepository.save({ ...status, ...data });
    return {
      message: '更新状态成功',
    };
  }
}
