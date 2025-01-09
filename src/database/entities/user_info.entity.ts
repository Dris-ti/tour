import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ACTIVITY_LOG_INFO } from './activity_log_info.entity';
import { BOOKING_INFO } from './booking_info.entity';
import { LOGIN_INFO } from './login_info.entity';
import { REVIEW_INFO } from './review_info.entity';
@Entity()
export class USER_INFO{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true})
  name: string;

  @Column({ length: 100, unique : true })
  email: string;

  @Column({nullable: true})
  phone_no: string;

  @Column({nullable: true})
  address: string;

  @Column({nullable: true})
  dob: Date;

  @Column({nullable: true})
  gender: string;

  @Column({nullable: true})
  nid_no: string;

  @Column({nullable: true})
  nid_pic_path: string;

  @Column({nullable: true})
  profile_pic_path: string;

  @Column({nullable: true})
  description:string;

  @Column()
  user_type: string;

  @Column()
  status: string;

  @OneToMany(() => ACTIVITY_LOG_INFO, (activityLog) => activityLog.user_id)
  activityLogs: ACTIVITY_LOG_INFO[];

  @OneToMany(() => BOOKING_INFO, (booking) => booking.user_id)
  bookings: BOOKING_INFO[];

  @OneToMany(() => LOGIN_INFO, (login) => login.user_id)
  logins: LOGIN_INFO[];

  @OneToMany(() => REVIEW_INFO, (review) => review.user_id)
  reviews: REVIEW_INFO[];
}