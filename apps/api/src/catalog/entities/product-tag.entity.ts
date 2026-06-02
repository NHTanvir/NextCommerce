import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_tags')
@Index(['productId', 'name'], { unique: true })
export class ProductTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  @Index()
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ length: 60 })
  @Index()
  name: string;
}
