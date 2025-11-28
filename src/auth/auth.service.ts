import {
  Injectable,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import type { Response } from 'express';

import { UserService } from '@/user/user.service';
import { SignupUserDto } from './dto/signup-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { EmailCode } from '@/auth/entities/email-code.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(EmailCode)
    private emailCodeRepository: Repository<EmailCode>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  // 生成 6 位验证码
  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 发送验证码
  async sendCode(email: string) {
    // 校验邮箱格式
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!reg.test(email)) {
      throw new BadRequestException('邮箱格式不正确');
    }

    const last = await this.emailCodeRepository.findOne({
      where: { email },
      order: { createdTime: 'DESC' },
    });

    if (last && Date.now() - last.createdTime.getTime() < 60 * 1000) {
      throw new BadRequestException('发送过于频繁，请稍后再试');
    }

    // 生成验证码
    const code = this.generateCode();
    const hashed = await bcrypt.hash(code, 10);

    await this.emailCodeRepository.save({
      email,
      code: hashed,
      expiresTime: new Date(Date.now() + 5 * 60 * 1000), // 5 分钟有效
    });

    // 发送邮件
    await this.mailerService.sendMail({
      to: email,
      subject: '您的博客验证码',
      html: `
        <p>你的验证码是：</p>
        <h2 style="font-size: 30px">${code}</h2>
        <p>5 分钟内有效，请勿泄露。</p>
      `,
    });

    return {
      message: '验证码发送成功',
    };
  }

  // 校验验证码
  async verifyCode(email: string, code: string) {
    const record = await this.emailCodeRepository.findOne({
      where: { email, used: false },
      order: { createdTime: 'DESC' },
    });

    if (!record) {
      throw new BadRequestException('请先发送验证码');
    }

    if (record.expiresTime < new Date()) {
      throw new BadRequestException('验证码已过期');
    }

    const ok = await bcrypt.compare(code, record.code);
    if (!ok) {
      throw new BadRequestException('验证码错误');
    }

    // 标记已使用
    record.used = true;
    await this.emailCodeRepository.save(record);

    return true;
  }

  // 验证用户
  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username);
    if (!user) {
      return null;
    }
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    // 移除密码字段
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async signin(data: SigninUserDto, res: Response) {
    const { username, password } = data;
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new HttpException('用户名或密码错误', HttpStatus.BAD_REQUEST);
    }
    // 生成 JWT token
    const payload = { username: user.username, id: user.id };
    const token = this.jwtService.sign(payload);

    // 判断是否为生产环境
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // 设置 cookie
    res.cookie('token', token, {
      httpOnly: true, // 防止 XSS 攻击
      secure: isProduction, // 生产环境使用 HTTPS
      sameSite: 'strict', // 防止 CSRF 攻击
      maxAge: 24 * 60 * 60 * 1000, // 1天
    });

    return {
      message: '登录成功',
      data: {
        token,
      },
    };
  }

  async signup(data: SignupUserDto, res: Response) {
    const { username, password, email, emailCode } = data;

    // 检查用户是否已存在
    const existingUser = await this.userService.findOne(username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userService.findUserByEmail(email);
    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 校验邮箱验证码
    await this.verifyCode(email, emailCode);

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userService.create({
      username,
      password: hashedPassword,
      email,
    });

    // 注册成功后自动登录,生成 JWT token
    const payload = { username: newUser.username, id: newUser.id };
    const token = this.jwtService.sign(payload);

    // 判断是否为生产环境
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // 设置 cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      message: '注册成功',
    };
  }

  signout(res: Response) {
    // 清除 cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
    });
    return {
      msg: '登出成功',
    };
  }
}
