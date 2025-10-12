import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, password } = createUserDto;
    // 保存用户
    const user = this.userRepository.create({ name, password });
    await this.userRepository.save(user);
    return {
      code: 200,
      msg: '操作成功',
    };
  }

  async getUserInfoById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'name', 'password'],
      relations: ['profile'],
    });
    return {
      code: 200,
      msg: '操作成功',
      data: user,
    };
  }

  async delete(id: string) {
    await this.userRepository.update(id, { is_delete: 1 });
    return {
      code: 200,
      msg: '操作成功',
    };
  }

  // async getUserLogs(id: string) {
  //   return await this.userRepository.findOne({
  //     where: {
  //       id,
  //     },
  //     relations: ['logs'],
  //   });
  // }

  // async getAllLogs() {
  //   return await this.logsRepository.find({ relations: ['user'] });
  // }

  // async getLogsCountGroupByResult(): Promise<
  //   { result: string; count: number }[]
  // > {
  //   return await this.logsRepository
  //     .createQueryBuilder('logs')
  //     .select('logs.result', 'result')
  //     .addSelect('COUNT(*)', 'count')
  //     .groupBy('logs.result')
  //     .getRawMany();
  // }
}
