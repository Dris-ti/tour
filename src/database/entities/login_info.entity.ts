import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { USER_INFO } from './user_info.entity';

@Entity()
export class LOGIN_INFO{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique : true })
  email: string;

  @Column()
  password: string;

  @OneToOne(() => USER_INFO)
  @JoinColumn({ name: 'user_id' })
  user_id: USER_INFO;
}