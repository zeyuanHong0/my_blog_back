import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
} from '@nestjs/common';
import { MiniappService } from './miniapp.service';
import { LoginMiniappDto } from './dto/login-miniapp.dto';
import { MiniappJwtAuthGuard } from '@/miniapp/guards/miniapp-jwt-auth.guard';
import {
  CurrentRefreshWxUser,
  CurrentWxUser,
} from '@/common/decorators/current-user.decorator';
import type { MiniappJwtPayload } from '@/miniapp/types/miniapp-jwt-payload.type';
import type { MiniappRefreshJwtPayload } from '@/miniapp/types/miniapp-refresh-jwt-paylod.type';
import { MiniappRefreshJwtAuthGuard } from '@/miniapp/guards/miniapp-refresh-jwt-auth.guard';

@Controller('miniapp')
export class MiniappController {
  constructor(private readonly miniappService: MiniappService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() loginMiniappDto: LoginMiniappDto) {
    return this.miniappService.wxLogin(loginMiniappDto.code);
  }

  @Get('isUserAdmin')
  @UseGuards(MiniappJwtAuthGuard)
  isUserAdmin(@CurrentWxUser() user: MiniappJwtPayload) {
    return this.miniappService.isUserAdmin(user.openid);
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(MiniappRefreshJwtAuthGuard)
  refreshToken(@CurrentRefreshWxUser() user: MiniappRefreshJwtPayload) {
    return this.miniappService.refresh(user.id);
  }
}
