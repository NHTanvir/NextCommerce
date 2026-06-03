import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from './address.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '@nextcommerce/shared';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => Address, { eager: true })
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @Column()
  addressId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  })
  @Index()
  status: OrderStatus;

  @Column({ type: 'int', unsigned: true })
  totalCents: number;

  @Column({ nullable: true })
  paymentRef: string | null;

  @Column({ nullable: true, length: 100 })
  trackingNumber: string | null;

  @Column({ nullable: true, length: 50 })
  carrier: string | null;

  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn()
  placedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
