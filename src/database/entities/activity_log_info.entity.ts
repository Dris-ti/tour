import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { USER_INFO } from './user_info.entity';

@Entity()
export class ACTIVITY_LOG_INFO{
  @PrimaryGeneratedColumn()
  id: number;


  @ManyToOne(() => USER_INFO, (user) => user.activityLogs, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user_id: USER_INFO;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column()
  createdAt: Date;
}