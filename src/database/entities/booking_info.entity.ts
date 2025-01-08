import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { USER_INFO } from './user_info.entity';
import { PACKAGE_INFO } from './package_info.entity';
import { TRANSPORT_INFO } from './transport_info.entity';


@Entity()
export class BOOKING_INFO{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  booking_date: Date;

  @Column()
  status:string

  @ManyToOne(() => USER_INFO, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user_id: USER_INFO;

  @ManyToOne(() => PACKAGE_INFO)
  @JoinColumn({ name: 'package_id' })
  package_id: PACKAGE_INFO;

  @ManyToOne(() => TRANSPORT_INFO)
  @JoinColumn({ name: 'transport_id' })
  transport_id: TRANSPORT_INFO;
}