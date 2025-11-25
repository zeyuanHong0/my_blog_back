import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

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

  @Column({
    type: 'enum',
    enum: ['local', 'cos'],
    default: 'local',
  })
  storageType: 'local' | 'cos'; // 存储类型

  @Column({ nullable: true })
  fileUrl?: string; // COS 存储时记录完整 URL，本地存储时为空

  @CreateDateColumn({ type: 'datetime' })
  createTime: Date;

  @Column({ nullable: true })
  uploadedBy?: string;
}
