import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Message {
  @IsIn(['system', 'user', 'assistant'])
  role: 'system' | 'user' | 'assistant';

  @IsString()
  content: string;
}

export class AiChatMessageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Message)
  messages: Message[];
}
