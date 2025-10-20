import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Blog } from '@/blog/entities/blog.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  icon: string;

  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updateTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  is_delete: number; // 0 未删除，1 已删除

  @ManyToMany(() => Blog, (blog) => blog.tags)
  blogs: Blog[];
}
