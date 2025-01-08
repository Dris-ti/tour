import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PACKAGE_INFO } from './package_info.entity';

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

  @OneToMany(() => PACKAGE_INFO, (packageInfo) => packageInfo.agency_id)
  packages: PACKAGE_INFO[];
}