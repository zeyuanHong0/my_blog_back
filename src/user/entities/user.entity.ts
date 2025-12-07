import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Blog } from '@/blog/entities/blog.entity';
import { UserOauth } from '@/user/entities/user-oauth.entity';
import { Role } from '@/enum/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: Role.TOURIST })
  accountType: Role;

  @CreateDateColumn({ type: 'datetime' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updateTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  is_delete: number; // 0 未删除，1 已删除

  @OneToMany(() => Blog, (blog) => blog.createUser)
  blogs: Blog[];

  @OneToMany(() => UserOauth, (oauth) => oauth.user)
  userOauths: UserOauth[];
}
