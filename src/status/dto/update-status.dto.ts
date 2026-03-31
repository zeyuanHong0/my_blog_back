import { IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty({ message: '状态不能为空' })
  is_online: number; // 0 离线，1 在线

  @IsNotEmpty({ message: '状态文本不能为空' })
  status_text: string;

  @IsNotEmpty({ message: '状态描述不能为空' })
  status_desc: string;
}
