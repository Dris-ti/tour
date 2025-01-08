import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class REVIEW_INFO{
  @PrimaryGeneratedColumn()
  id: number;


  @JoinColumn({'name': 'user_id'})
  user_id: number;

  @JoinColumn({'name': 'target_id'})
  target_id: number;


  @JoinColumn({'name': 'target_type'})
  target_type: string;

  @Column()
  review_text: number;

  @Column()
  rating: number;
}