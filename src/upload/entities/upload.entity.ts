import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { FormattedCreateDateColumn } from '@/common/decorators/formatted-date-column.decorator';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @FormattedCreateDateColumn()
  createTime: Date;

  @Column({ nullable: true })
  uploadedBy?: string;
}
