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
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import type { AxiosRequestConfig } from 'axios';

import { UserService } from '@/user/user.service';
import { SignupUserDto } from './dto/signup-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { EmailCode } from '@/auth/entities/email-code.entity';
import { ConfigEnum } from '@/enum/config.enum';
import { OAuthProvider } from '@/enum/oauth-provider.enum';
import type { GithubUser, GithubEmail } from './types/github-user.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(EmailCode)
    private emailCodeRepository: Repository<EmailCode>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly httpService: HttpService,
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

    // 设置 cookie
    res.cookie('token', token, {
      httpOnly: true, // 防止 XSS 攻击
      secure: false, // 如果没有 HTTPS，设为 false
      sameSite: 'lax', // 允许同站导航携带 Cookie
      path: '/', // 确保在所有路径下都可用
      domain: '', // 明确设置为当前域名
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

    // 设置 cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: '',
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
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: '',
    });
    return {
      msg: '登出成功',
    };
  }

  /**
   * 获取 github 授权 url
   */
  getGithubAuthorizeUrl() {
    const clientId = this.configService.get(ConfigEnum.GITHUB_CLIENT_ID);
    const redirectUri = this.configService.get(
      ConfigEnum.GITHUB_CALLBACK_URL,
    ) as string;
    const scope = 'read:user user:email';
    const state = Math.random().toString(36).substring(2);
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
    return {
      data: {
        url,
        state,
      },
    };
  }

  /**
   * github 登录
   */
  async githubLogin(code: string, res: Response) {
    // 获取 access_token
    const accessToken: string = await this.getGithubAccessToken(code);
    // 获取github用户信息
    const githubUserInfo: GithubUser =
      await this.getGithubUserInfo(accessToken);
    let email: string | null = githubUserInfo.email;
    if (!githubUserInfo.email) {
      // 获取用户邮箱
      const emailList: GithubEmail[] =
        await this.getGithubUserEmail(accessToken);
      email = emailList.find((item) => item.primary && item.verified)
        ?.email as string;
    }

    // 查找或创建用户
    let user = await this.userService.findOauthUser(
      OAuthProvider.GITHUB,
      githubUserInfo.id,
    );

    if (!user) {
      // 用户不存在，创建新用户
      user = await this.userService.createOauthUser(
        githubUserInfo.name,
        email!,
        OAuthProvider.GITHUB,
        githubUserInfo.id,
      );
    }

    const payload = { username: user.username, id: user.id };
    const token = this.jwtService.sign(payload);

    // 设置 cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: '',
      maxAge: 24 * 60 * 60 * 1000,
    });
    // 重定向到前端成功页面
    res.redirect('http://localhost:5173/github-callback');

    return {
      message: '登录成功',
      data: {
        token,
      },
    };
  }

  /**
   * 用code换取github access_token
   */
  async getGithubAccessToken(code: string) {
    const requestConfig: AxiosRequestConfig = {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    };
    const proxyHost = this.configService.get(ConfigEnum.HTTP_PROXY_HOST);
    const proxyPort = this.configService.get(ConfigEnum.HTTP_PROXY_PORT);
    if (proxyHost && proxyPort) {
      requestConfig.proxy = {
        host: proxyHost,
        port: parseInt(proxyPort as string),
        protocol: 'http',
      };
    }
    const res: any = await firstValueFrom(
      this.httpService.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.configService.get('GITHUB_CLIENT_ID'),
          client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
          code: code,
        },
        requestConfig,
      ),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    return res.data.access_token;
  }

  /**
   * 获取 github 用户信息
   */
  async getGithubUserInfo(accessToken: string) {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000,
    };
    const proxyHost = this.configService.get(ConfigEnum.HTTP_PROXY_HOST);
    const proxyPort = this.configService.get(ConfigEnum.HTTP_PROXY_PORT);
    if (proxyHost && proxyPort) {
      requestConfig.proxy = {
        host: proxyHost,
        port: parseInt(proxyPort as string),
        protocol: 'http',
      };
    }
    const res: any = await firstValueFrom(
      this.httpService.get('https://api.github.com/user', requestConfig),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    return res.data;
  }

  /**
   * 获取github 用户邮箱
   */
  async getGithubUserEmail(accessToken: string) {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000,
    };
    const proxyHost = this.configService.get(ConfigEnum.HTTP_PROXY_HOST);
    const proxyPort = this.configService.get(ConfigEnum.HTTP_PROXY_PORT);
    if (proxyHost && proxyPort) {
      requestConfig.proxy = {
        host: proxyHost,
        port: parseInt(proxyPort as string),
        protocol: 'http',
      };
    }
    const res: any = await firstValueFrom(
      this.httpService.get('https://api.github.com/user/emails', requestConfig),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    return res.data;
  }
}
