import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import {
  FormattedCreateDateColumn,
  FormattedUpdateDateColumn,
} from '@/common/decorators/formatted-date-column.decorator';
import { Blog } from '@/blog/entities/blog.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text' })
  icon: string;

  @FormattedCreateDateColumn()
  createTime: Date;

  @FormattedUpdateDateColumn()
  updateTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  is_delete: number; // 0 未删除，1 已删除

  @ManyToMany(() => Blog, (blog) => blog.tags)
  blogs: Blog[];
}
