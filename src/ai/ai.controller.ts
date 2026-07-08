import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AiService } from './ai.service';
import { AiChatMessageDto } from './dto/ai-chat.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  aiChat(
    @Body() body: AiChatMessageDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.aiService.aiChat(body.messages, req, res);
  }
}
