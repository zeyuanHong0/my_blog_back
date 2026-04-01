import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StatusService } from './status.service';

import { UpdateStatusDto } from './dto/update-status.dto';
import { MiniappJwtAuthGuard } from '@/miniapp/guards/miniapp-jwt-auth.guard';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post('update')
  @HttpCode(200)
  @UseGuards(MiniappJwtAuthGuard)
  updateStatus(@Body() data: UpdateStatusDto) {
    return this.statusService.updateStatus(data);
  }

  @Get('getStatus')
  getStatus() {
    return this.statusService.getStatus();
  }
}
