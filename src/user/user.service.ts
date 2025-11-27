import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password, email } = createUserDto;
    // 保存用户
    const user = this.userRepository.create({ username, password, email });
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async findAll(username?: string) {
    const users = await this.userRepository.find({
      where: {
        ...(username && { username }),
      },
    });
    return {
      data: users,
    };
  }

  async getProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'username', 'email', 'accountType'],
    });
    return {
      data: {
        userInfo: user,
      },
    };
  }

  async findOne(username: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
      select: ['id', 'username', 'password'],
    });
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: ['id', 'username', 'password'],
    });
    return user;
  }

  async getUserInfoById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'username', 'password'],
      relations: ['profile'],
    });
    return {
      data: user,
    };
  }

  async delete(id: string) {
    await this.userRepository.update(id, { is_delete: 1 });
  }
}
