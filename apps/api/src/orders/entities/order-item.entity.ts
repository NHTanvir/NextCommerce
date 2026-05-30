import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @Column()
  variantId: string;

  @Column({ type: 'int', unsigned: true })
  quantity: number;

  @Column({ type: 'int', unsigned: true })
  unitPriceCents: number;

  @Column({ length: 200 })
  productTitle: string;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  size: number;

  @Column({ length: 50 })
  color: string;
}
