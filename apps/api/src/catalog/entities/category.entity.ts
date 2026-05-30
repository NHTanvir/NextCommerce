import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Category, (c) => c.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Category | null;

  @Column({ nullable: true })
  parentId: string | null;

  @OneToMany(() => Category, (c) => c.parent)
  children: Category[];

  @CreateDateColumn()
  createdAt: Date;
}
