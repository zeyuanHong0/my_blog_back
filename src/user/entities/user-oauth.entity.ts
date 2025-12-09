import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '@/user/entities/user.entity';
import { OAuthProvider } from '@/enum/oauth-provider.enum';

@Entity('user_oauth')
export class UserOauth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  userId: string;

  @Column({ type: 'enum', enum: OAuthProvider })
  provider: OAuthProvider;

  @Column()
  providerId: string;

  @CreateDateColumn({ type: 'datetime' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updateTime: Date;

  @ManyToOne(() => User, (user) => user.userOauths, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
