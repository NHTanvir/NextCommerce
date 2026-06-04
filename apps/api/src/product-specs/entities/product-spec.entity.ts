import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('product_specs')
@Unique(['productId', 'key'])
@Index(['productId'])
export class ProductSpec {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  productId: string;

  @Column({ length: 100 })
  key: string;

  @Column({ length: 500 })
  value: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ length: 100, nullable: true })
  group: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
