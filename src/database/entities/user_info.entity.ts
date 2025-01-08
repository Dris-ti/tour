import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
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
}