import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signup-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  async login(
    @Body() body: SigninUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 登录
    return this.authService.signin(body, res);
  }

  @Post('/signup')
  async register(
    @Body() body: SignupUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 注册
    return this.authService.signup(body, res);
  }

  @Post('/signout')
  logout(@Res({ passthrough: true }) res: Response) {
    // 登出
    return this.authService.signout(res);
  }

  @Post('sendCode')
  sendCode(@Body('email') email: string) {
    return this.authService.sendCode(email);
  }

  @Get('/github/url')
  getGithubAuthorizeUrl() {
    return this.authService.getGithubAuthorizeUrl();
  }

  @Get('/github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.githubLogin(code, res);
  }
}
