import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ nullable: true })
  bannerImageUrl: string | null;

  @Column({ type: 'json', default: '[]' })
  productIds: string[];

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  discountPercent: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'datetime' })
  startsAt: Date | null;

  @Column({ nullable: true, type: 'datetime' })
  endsAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
