import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('product_bundles')
export class ProductBundle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'simple-array' })
  productIds: string[];

  @Column({ type: 'int' })
  discountPercent: number;

  @Column({ type: 'int', nullable: true })
  discountAmountCents: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  startsAt: Date | null;

  @Column({ nullable: true })
  endsAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
