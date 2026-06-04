import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, OneToMany } from 'typeorm';
import { Answer } from './answer.entity';

@Entity('product_questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  productId: string;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: false })
  isAnswered: boolean;

  @Column({ default: false })
  isHidden: boolean;

  @OneToMany(() => Answer, (a) => a.question, { cascade: true })
  answers: Answer[];

  @CreateDateColumn()
  createdAt: Date;
}
