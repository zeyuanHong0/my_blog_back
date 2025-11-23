import { IsNotEmpty, ValidateIf } from 'class-validator';
import { IsSafeSvg } from '@/common/decorators/is-safe-svg.decorator';

export class CreateTagDto {
  @IsNotEmpty({ message: '标签名称不能为空' })
  name: string;

  @ValidateIf(
    (o: CreateTagDto) =>
      o.icon !== undefined && o.icon !== null && o.icon !== '',
  )
  @IsSafeSvg({ message: 'SVG 格式不合法或存在安全隐患' })
  icon?: string;
}
