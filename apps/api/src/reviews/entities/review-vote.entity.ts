import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('review_votes')
@Unique(['reviewId', 'userId'])
@Index(['reviewId'])
export class ReviewVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  reviewId: string;

  @Column({ length: 36 })
  userId: string;

  @Column({ type: 'boolean' })
  isHelpful: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
