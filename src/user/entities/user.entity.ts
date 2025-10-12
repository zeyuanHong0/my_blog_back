import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Blog } from '../../blog/entities/blog.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updateTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  is_delete: number; // 0 未删除，1 已删除

  @OneToMany(() => Blog, (blog) => blog.createUser)
  blogs: Blog[];
}
