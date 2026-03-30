import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { MiniappService } from './miniapp.service';
import { LoginMiniappDto } from './dto/login-miniapp.dto';

@Controller('miniapp')
export class MiniappController {
  constructor(private readonly miniappService: MiniappService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() loginMiniappDto: LoginMiniappDto) {
    return this.miniappService.wxLogin(loginMiniappDto.code);
  }
}
