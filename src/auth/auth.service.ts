import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../src/user/user.service';
import { SignupUserDto } from './dto/signup-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // 验证用户
  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username);
    if (!user) {
      return null;
    }
    // 验证密码
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    // 移除密码字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async signin(data: SigninUserDto) {
    const { username, password } = data;
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    // 生成 JWT token
    const payload = { username: user.username, id: user.id };
    const token = this.jwtService.sign(payload);
    return {
      code: 200,
      msg: '登录成功',
      data: {
        token,
      },
    };
  }

  async signup(data: SignupUserDto) {
    const { username, password, email } = data;

    // 检查用户是否已存在
    const existingUser = await this.userService.findOne(username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await this.userService.create({
      username,
      password: hashedPassword,
      email,
    });
    return res;
  }
}
