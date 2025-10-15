import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import {
  FormattedCreateDateColumn,
  FormattedUpdateDateColumn,
} from '@/common/decorators/formatted-date-column.decorator';

import { Blog } from '@/blog/entities/blog.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ default: 'test' })
  accountType: string;

  @FormattedCreateDateColumn()
  createTime: Date;

  @FormattedUpdateDateColumn()
  updateTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  is_delete: number; // 0 未删除，1 已删除

  @OneToMany(() => Blog, (blog) => blog.createUser)
  blogs: Blog[];
}
