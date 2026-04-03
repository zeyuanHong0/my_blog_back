import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigEnum } from '@/enum/config.enum';
import { UpdateStatusDto } from '@/status/dto/update-status.dto';
import { Status } from '@/status/entities/status.entity';
import { StatusGateway } from '@/status/status.gateway';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    private readonly configService: ConfigService,
    private readonly statusGateway: StatusGateway,
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
    // 广播状态更新事件，通知所有连接的客户端
    this.statusGateway.broadcastStatus<UpdateStatusDto>('status_update', data);
    return {
      message: '更新状态成功',
    };
  }

  // 获取状态
  async getStatus() {
    const status = await this.statusRepository.findOne({
      where: {},
      order: {
        id: 'ASC',
      },
      select: ['is_online', 'status_text', 'status_desc'],
    });
    return {
      data: {
        ...status,
      },
    };
  }
}
