import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';


@Entity()
export class PAYMENT_INFO{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  booking_id: number;

  @Column()
  payment_method: string;

  @Column()
  amount: number;

  @Column()
  transaction_no: string;

  @Column()
  payment_date: Date;
}