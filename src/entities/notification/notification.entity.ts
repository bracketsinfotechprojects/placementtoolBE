import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notifications', { orderBy: { id: 'DESC' } })
@Index(['user_id'])
@Index(['user_id', 'is_read'])
export class Notification {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'user_id', nullable: false })
  user_id: number;

  @Column({ type: 'varchar', length: 255, name: 'title', nullable: false })
  title: string;

  @Column({ type: 'text', name: 'message', nullable: false })
  message: string;

  @Column({
    type: 'enum',
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
    name: 'type',
  })
  type: 'info' | 'success' | 'warning' | 'error';

  @Column({ type: 'boolean', name: 'is_read', default: false })
  is_read: boolean;

  @Column({ type: 'varchar', length: 255, name: 'action_url', nullable: true })
  action_url: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updated_at: Date;
}
