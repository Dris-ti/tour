import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class LOGIN_INFO{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique : true })
  email: string;

  @Column()
  password: string;

  @Column()
  user_id: number;
}