import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { createDateTransformer } from '@/common/transformers/date.transformer';

interface Options {
  format?: string;
  type?: 'timestamp' | 'datetime';
}

/**
 * 通用时间列装饰器
 */
export function FormattedDateColumn(options: Options = {}): PropertyDecorator {
  const { format = 'YYYY-MM-DD HH:mm:ss', type = 'timestamp' } = options;

  return Column({
    type,
    transformer: createDateTransformer(format),
  });
}

/**
 * 格式化创建时间列
 */
export function FormattedCreateDateColumn(
  format = 'YYYY-MM-DD HH:mm:ss',
): PropertyDecorator {
  return CreateDateColumn({
    type: 'timestamp',
    transformer: createDateTransformer(format),
  });
}

/**
 * 格式化更新时间列
 */
export function FormattedUpdateDateColumn(
  format = 'YYYY-MM-DD HH:mm:ss',
): PropertyDecorator {
  return UpdateDateColumn({
    type: 'timestamp',
    transformer: createDateTransformer(format),
  });
}
