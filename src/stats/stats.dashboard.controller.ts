import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '@/auth/guards';
import type { JwtPayload } from '@/auth/types/jwt-payload.type';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsDashboardController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  getDashboardStats(@CurrentUser() user: JwtPayload) {
    return this.statsService.getDashboardStats(user);
  }
}
