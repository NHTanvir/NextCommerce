import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  size: number;

  @Column({ length: 50 })
  color: string;

  @Column({ unique: true, length: 100 })
  @Index()
  sku: string;

  @Column({ type: 'int', default: 0, unsigned: true })
  stockQty: number;

  @Column({ type: 'int', unsigned: true })
  priceCents: number;
}
