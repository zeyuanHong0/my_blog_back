import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '@/auth/guards';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsDashboardController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.statsService.getDashboardStats();
  }
}
