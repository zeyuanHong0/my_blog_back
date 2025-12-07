import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserOauth } from '@/user/entities/user-oauth.entity';
import { OAuthProvider } from '@/enum/oauth-provider.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserOauth)
    private readonly userOauthRepository: Repository<UserOauth>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password, email } = createUserDto;
    // 保存用户
    const user = this.userRepository.create({ username, password, email });
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async createOauthUser(
    username: string,
    email: string,
    provider: OAuthProvider,
    providerId: string | number,
  ) {
    const user = this.userRepository.create({ username, email });
    const savedUser = await this.userRepository.save(user);
    const userOauth = this.userOauthRepository.create({
      userId: savedUser.id,
      provider,
      providerId: String(providerId),
    });
    await this.userOauthRepository.save(userOauth);
    return savedUser;
  }

  async findOauthUser(provider: OAuthProvider, providerId: string | number) {
    const userOauth = await this.userOauthRepository.findOne({
      where: {
        provider,
        providerId: String(providerId),
      },
      relations: ['user'],
    });
    return userOauth?.user;
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
    return await this.userRepository.findOne({
      where: {
        username,
      },
      select: ['id', 'username', 'password'],
    });
  }

  async findUserById(id: string) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
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
