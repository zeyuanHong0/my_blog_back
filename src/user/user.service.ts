import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserOauth } from '@/user/entities/user-oauth.entity';
import { OAuthProvider } from '@/enum/oauth-provider.enum';
import { Role } from '@/enum/role.enum';
import { UpdateUserDto } from '@/user/dto/update-user.dto';

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

  async update(id: string, updateUserDto: Omit<UpdateUserDto, 'id'>) {
    await this.userRepository.update(id, updateUserDto);
  }

  async createOauthUser(
    username: string,
    email: string,
    provider: OAuthProvider,
    providerId: string | number,
  ) {
    let user = await this.findUserByEmail(email);
    if (!user) {
      user = await this.userRepository.save(
        this.userRepository.create({ username: username || '无名侠', email }),
      );
    }
    await this.userOauthRepository.save(
      this.userOauthRepository.create({
        userId: user.id,
        provider,
        providerId: String(providerId),
      }),
    );
    return user;
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
      relations: ['userOauths'],
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

  async getUserList(name: string, pageNum: number, pageSize: number) {
    const where = name
      ? [{ username: Like(`%${name}%`) }, { email: Like(`%${name}%`) }]
      : undefined;
    const [userList, total] = await this.userRepository.findAndCount({
      where,
      select: [
        'id',
        'username',
        'email',
        'createTime',
        'updateTime',
        'is_delete',
      ],
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: {
        createTime: 'DESC',
        id: 'DESC',
      },
    });
    return {
      data: {
        list: userList,
        total,
        pageNum: Number(pageNum),
        pageSize: Number(pageSize),
      },
    };
  }

  async changeUserStatus(id: string, status: 0 | 1) {
    await this.userRepository.update(id, { is_delete: status });
    return {
      message: '操作成功',
    };
  }

  async isAdmin(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    return {
      data: {
        isAdmin: user?.accountType === Role.ADMIN,
      },
    };
  }

  async updateProfile(
    id: string,
    data: {
      username?: string;
      password?: string;
      confirmPassword?: string;
    },
  ) {
    const { username, password, confirmPassword } = data;
    const user = await this.findUserById(id);
    if (!user) throw new Error('用户不存在');
    if (username) {
      const findUserName = await this.findOne(username);
      if (findUserName) throw new Error('用户名已存在');
    }
    if (password && password !== confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }
    const updateData: Record<string, string> = {};
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    await this.userRepository.update(id, updateData);
    return {
      message: '更新信息成功',
    };
  }
}
