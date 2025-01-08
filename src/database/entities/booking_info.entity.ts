import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';


@Entity()
export class BOOKING_INFO{
  @PrimaryGeneratedColumn()
  id: number;


  @JoinColumn({'name': 'user_id'})
  user_id: number;


  @JoinColumn({'name': 'package_id'})
  package_id: number;

  
  @JoinColumn({'name': 'transport_id'})
  transport_id: number;

  @Column()
  booking_date: Date;

  @Column()
  status:string
}