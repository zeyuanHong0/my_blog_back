import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Tag } from '../../tag/entities/tag.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column()
  description: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.blogs)
  @JoinColumn({ name: 'createUser' })
  createUser: User;

  @ManyToMany(() => Tag, (tag) => tag.blogs)
  @JoinTable({
    name: 'blog_tags',
    joinColumn: { name: 'blogId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updateTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  is_delete: number; // 0 未删除，1 已删除
}
