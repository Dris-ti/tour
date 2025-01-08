import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class AGENCY_INFO{
  @PrimaryGeneratedColumn()
  id:number;

  @Column({ length: 100})
  name: string;

  @Column({ length: 100, unique : true })
  email: string;

  @Column()
  phone_no: string;

  @Column()
  address: string;

  @Column()
  company_size:number;

  @Column()
  description:string;

  @Column()
  status: string;
}