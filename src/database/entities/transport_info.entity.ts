import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BOOKING_INFO } from './booking_info.entity';


@Entity()
export class TRANSPORT_INFO{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  price_per_seat: number;

  @Column()
  capacity: number;

  @OneToMany(() => BOOKING_INFO, (booking) => booking.transport_id)
  bookings: BOOKING_INFO[];
}