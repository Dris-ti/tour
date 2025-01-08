import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { BOOKING_INFO } from './booking_info.entity';


@Entity()
export class PAYMENT_INFO{
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => BOOKING_INFO, (booking) => booking.payments)
  // @JoinColumn({ name: 'booking_id' })
  // booking: BOOKING_INFO;

  @Column()
  payment_method: string;

  @Column()
  amount: number;

  @Column()
  transaction_no: string;

  @Column()
  payment_date: Date;
}