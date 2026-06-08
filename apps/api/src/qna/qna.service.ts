import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class AskQuestionDto {
  @IsString() productId: string;
  @IsString() @MinLength(10) @MaxLength(500) body: string;
}

export class AnswerQuestionDto {
  @IsString() @MinLength(10) @MaxLength(1000) body: string;
}

@Injectable()
export class QnaService {
  constructor(
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
    @InjectRepository(Answer) private readonly answerRepo: Repository<Answer>,
  ) {}

  async askQuestion(userId: string, dto: AskQuestionDto): Promise<Question> {
    const question = this.questionRepo.create({
      productId: dto.productId,
      userId,
      body: dto.body,
    });
    return this.questionRepo.save(question);
  }

  async answerQuestion(
    questionId: string,
    userId: string,
    dto: AnswerQuestionDto,
    isAdmin = false,
  ): Promise<Answer> {
    const question = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');

    const answer = this.answerRepo.create({
      questionId,
      userId,
      body: dto.body,
      isAdminAnswer: isAdmin,
    });

    const saved = await this.answerRepo.save(answer);

    if (!question.isAnswered) {
      await this.questionRepo.update(questionId, { isAnswered: true });
    }

    return saved;
  }

  async getForProduct(productId: string): Promise<Question[]> {
    return this.questionRepo.find({
      where: { productId, isHidden: false },
      relations: ['answers'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteQuestion(questionId: string, userId: string, isAdmin = false): Promise<void> {
    const question = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');
    if (!isAdmin && question.userId !== userId) throw new ForbiddenException('Not your question');
    await this.questionRepo.remove(question);
  }

  async hideQuestion(questionId: string): Promise<Question> {
    const question = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');
    await this.questionRepo.update(questionId, { isHidden: true });
    return this.questionRepo.findOne({ where: { id: questionId } }) as Promise<Question>;
  }

  async findAllForAdmin(page = 1, limit = 20): Promise<{ data: Question[]; total: number }> {
    const [data, total] = await this.questionRepo.findAndCount({
      relations: ['answers'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async getStats(): Promise<{
    totalQuestions: number;
    answered: number;
    unanswered: number;
    hidden: number;
    totalAnswers: number;
  }> {
    const qRow = await this.questionRepo
      .createQueryBuilder('q')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN q.isAnswered = 1 THEN 1 ELSE 0 END)', 'answered')
      .addSelect('SUM(CASE WHEN q.isAnswered = 0 AND q.isHidden = 0 THEN 1 ELSE 0 END)', 'unanswered')
      .addSelect('SUM(CASE WHEN q.isHidden = 1 THEN 1 ELSE 0 END)', 'hidden')
      .getRawOne();

    const totalAnswers = await this.answerRepo.count();

    return {
      totalQuestions: Number(qRow.total) || 0,
      answered: Number(qRow.answered) || 0,
      unanswered: Number(qRow.unanswered) || 0,
      hidden: Number(qRow.hidden) || 0,
      totalAnswers,
    };
  }
}
