import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';


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


  @JoinColumn({'name': 'agency_id'})
  agency_id: number;
}