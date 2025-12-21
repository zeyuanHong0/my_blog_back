import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Blog } from '@/blog/entities/blog.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn({ type: 'datetime' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updateTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  is_delete: number; // 0 未删除，1 已删除

  @OneToMany(() => Blog, (blog) => blog.category)
  blogs: Blog[];
}
