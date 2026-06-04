import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { QnaService } from './qna.service';
import { QnaController } from './qna.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer])],
  providers: [QnaService],
  controllers: [QnaController],
  exports: [QnaService],
})
export class QnaModule {}
