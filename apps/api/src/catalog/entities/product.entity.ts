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
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 200 })
  @Index()
  slug: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 100 })
  @Index()
  brand: string;

  @Column({ type: 'int', unsigned: true })
  basePriceCents: number;

  @Column({ type: 'json', default: '[]' })
  images: Array<{ url: string; alt: string }>;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Category, { eager: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  @Index()
  categoryId: string;

  @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true, eager: false })
  variants: ProductVariant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
