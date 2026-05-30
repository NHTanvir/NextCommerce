import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ length: 200 })
  line1: string;

  @Column({ length: 200, nullable: true })
  line2: string | null;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  country: string;

  @Column({ length: 20 })
  postalCode: string;
}
