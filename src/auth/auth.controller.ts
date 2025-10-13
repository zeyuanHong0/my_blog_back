import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signup-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  async login(@Body() body: SigninUserDto) {
    // 登录
    return this.authService.signin(body);
  }

  @Post('/signup')
  async register(@Body() body: SignupUserDto) {
    // 注册
    return this.authService.signup(body);
  }
}
