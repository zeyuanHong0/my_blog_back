import { Body, Controller, Get, Put, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { type JwtPayload } from '@/auth/types/jwt-payload.type';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 获取当前用户信息
  @Get('/profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.id);
  }

  // 判断用户是否是管理员
  @Get('/isAdmin')
  isAdmin(@CurrentUser() user: JwtPayload) {
    return this.userService.isAdmin(user.id);
  }

  // 修改用户信息
  @Put('/update/Profile')
  async update(
    @CurrentUser() user: JwtPayload,
    @Body()
    data: { username?: string; password?: string; confirmPassword?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.userService.updateProfile(user.id, data);
    // 用户名或密码变更后清除 cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: '',
    });
    return result;
  }
}
