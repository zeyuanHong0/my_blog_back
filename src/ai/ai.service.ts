import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import OpenAI from 'openai';

import { ConfigEnum } from '@/enum/config.enum';
import { Message } from './dto/ai-chat.dto';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

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
      model: 'deepseek-v4-flash',
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

  async aiChat(messages: Message[], req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // 客户端断开检测
    let aborted = false;
    res.on('close', () => {
      aborted = true;
    });
    // 超时
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const completion = await this.client.chat.completions.create(
        {
          model: 'deepseek-v4-flash',
          messages: messages as ChatCompletionMessageParam[],
          stream: true,
        },
        { signal: controller.signal },
      );
      for await (const chunk of completion) {
        if (aborted) break;
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify(content)}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Error';
      console.error('AI 请求失败:', message);
      if (!aborted) {
        console.error('AI 请求失败:', message);
        res.write(`data: ${JSON.stringify('[错误] ' + message)}\n\n`);
        res.write('data: [DONE]\n\n');
      }
    } finally {
      clearTimeout(timeout);
      res.end();
    }
  }
}
