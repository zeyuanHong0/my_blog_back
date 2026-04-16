import { Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { type JwtPayload } from '@/auth/types/jwt-payload.type';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('addUser')

  // 获取当前用户信息
  @Get('/profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.id);
  }
}
