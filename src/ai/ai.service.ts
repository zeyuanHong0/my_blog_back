import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { ConfigEnum } from '@/enum/config.enum';

@Injectable()
export class AiService {
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.configService = configService;
    this.client = new OpenAI({
      baseURL: this.configService.get<string>(ConfigEnum.DEEPSEEK_BASE_URL),
      apiKey: this.configService.get<string>(ConfigEnum.DEEPSEEK_API_KEY),
    });
  }

  async summarizeBlog(content: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的技术博客编辑。',
        },
        {
          role: 'user',
          content: `请对下面这篇博客内容进行总结：要求：1. 使用中文\n2. 3~4 行\n3. 不添加原文没有的观点\n博客内容：\n${content}\n`,
        },
      ],
    });
    return res.choices[0].message.content || '';
  }
}
