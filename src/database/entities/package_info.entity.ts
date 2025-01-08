import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { AGENCY_INFO } from './agency_info.entity';


@Entity()
export class PACKAGE_INFO{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100})
  name: string;

  @Column()
  description: string;

  @Column()
  price:number;


  @ManyToOne(() => AGENCY_INFO, (agency) => agency.packages)
  @JoinColumn({ name: 'agency_id' })
  agency_id: AGENCY_INFO;
}