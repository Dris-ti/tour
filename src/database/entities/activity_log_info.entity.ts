import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ACTIVITY_LOG_INFO{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column()
  createdAt: Date;
}