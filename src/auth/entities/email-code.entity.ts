import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('email_codes')
export class EmailCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column()
  expiresTime: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdTime: Date;
}
