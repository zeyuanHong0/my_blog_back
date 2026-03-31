import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('status')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', default: 0 })
  is_online: number; // 0 离线，1 在线

  @Column({ type: 'varchar', length: 10, default: '' })
  status_text: string;

  @Column({ type: 'varchar', length: 10, default: '' })
  status_desc: string;

  @UpdateDateColumn({ type: 'datetime' })
  updateTime: Date;
}
