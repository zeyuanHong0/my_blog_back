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

import { User } from '@/user/entities/user.entity';
import { Tag } from '@/tag/entities/tag.entity';
import { Category } from '@/category/entities/category.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column()
  description: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'tinyint', default: 0 })
  published: number; // 0 未发布，1 已发布

  @Column({ length: 36, nullable: true })
  createUser: string;

  @Column({ type: 'text', nullable: true })
  aiSummary: string;

  @ManyToOne(() => User, (user) => user.blogs, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'createUser' })
  createUserRelation: User;

  @ManyToMany(() => Tag, (tag) => tag.blogs, {
    createForeignKeyConstraints: false,
  })
  @JoinTable({
    name: 'blog_tags',
    joinColumn: { name: 'blogId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @ManyToOne(() => Category, (category) => category.blogs, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @CreateDateColumn({ type: 'datetime' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updateTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  is_delete: number; // 0 未删除，1 已删除
}
