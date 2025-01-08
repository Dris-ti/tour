import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { USER_INFO } from './user_info.entity';

@Entity()
export class REVIEW_INFO{
  @PrimaryGeneratedColumn()
  id: number;


  @ManyToOne(() => USER_INFO, (user) => user.reviews)
  @JoinColumn({ name: 'user_id' })
  user_id: USER_INFO;

  // needs to change
  // @JoinColumn({'name': 'target_id'})
  target_id: number;


  @JoinColumn({'name': 'target_type'})
  target_type: string;

  @Column()
  review_text: number;

  @Column()
  rating: number;
}