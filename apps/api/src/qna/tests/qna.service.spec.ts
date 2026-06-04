import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { QnaService } from '../qna.service';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';

const mockQuestionRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockAnswerRepo = {
  create: jest.fn(),
  save: jest.fn(),
};

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q-1',
    productId: 'p-1',
    userId: 'user-1',
    body: 'Does this come in wide width?',
    isAnswered: false,
    isHidden: false,
    answers: [],
    createdAt: new Date(),
    ...overrides,
  } as Question;
}

describe('QnaService', () => {
  let service: QnaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QnaService,
        { provide: getRepositoryToken(Question), useValue: mockQuestionRepo },
        { provide: getRepositoryToken(Answer), useValue: mockAnswerRepo },
      ],
    }).compile();

    service = module.get<QnaService>(QnaService);
    jest.clearAllMocks();
  });

  describe('askQuestion', () => {
    it('creates and saves a question', async () => {
      const question = makeQuestion();
      mockQuestionRepo.create.mockReturnValue(question);
      mockQuestionRepo.save.mockResolvedValue(question);

      const result = await service.askQuestion('user-1', {
        productId: 'p-1',
        body: 'Does this come in wide width?',
      });

      expect(mockQuestionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', productId: 'p-1' }),
      );
      expect(result).toEqual(question);
    });
  });

  describe('answerQuestion', () => {
    it('throws NotFoundException for unknown question', async () => {
      mockQuestionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.answerQuestion('bad-id', 'user-1', { body: 'Yes, it does come in wide width.' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates answer and marks question as answered', async () => {
      const question = makeQuestion({ isAnswered: false });
      const answer = { id: 'a-1', questionId: 'q-1', body: 'Yes it does.', isAdminAnswer: false };
      mockQuestionRepo.findOne.mockResolvedValue(question);
      mockAnswerRepo.create.mockReturnValue(answer);
      mockAnswerRepo.save.mockResolvedValue(answer);
      mockQuestionRepo.update.mockResolvedValue({});

      const result = await service.answerQuestion('q-1', 'user-1', { body: 'Yes it does.' });

      expect(result).toEqual(answer);
      expect(mockQuestionRepo.update).toHaveBeenCalledWith('q-1', { isAnswered: true });
    });

    it('marks admin answers with isAdminAnswer=true', async () => {
      const question = makeQuestion();
      const answer = { id: 'a-1', isAdminAnswer: true };
      mockQuestionRepo.findOne.mockResolvedValue(question);
      mockAnswerRepo.create.mockReturnValue(answer);
      mockAnswerRepo.save.mockResolvedValue(answer);
      mockQuestionRepo.update.mockResolvedValue({});

      await service.answerQuestion('q-1', 'admin-1', { body: 'Official answer here.' }, true);

      expect(mockAnswerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isAdminAnswer: true }),
      );
    });

    it('does not re-mark isAnswered when already answered', async () => {
      const question = makeQuestion({ isAnswered: true });
      const answer = { id: 'a-1' };
      mockQuestionRepo.findOne.mockResolvedValue(question);
      mockAnswerRepo.create.mockReturnValue(answer);
      mockAnswerRepo.save.mockResolvedValue(answer);

      await service.answerQuestion('q-1', 'user-1', { body: 'Additional answer.' });

      expect(mockQuestionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteQuestion', () => {
    it('throws NotFoundException for unknown question', async () => {
      mockQuestionRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteQuestion('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when non-owner non-admin tries to delete', async () => {
      mockQuestionRepo.findOne.mockResolvedValue(makeQuestion({ userId: 'owner' }));

      await expect(service.deleteQuestion('q-1', 'other-user', false)).rejects.toThrow(ForbiddenException);
    });

    it('allows owner to delete their own question', async () => {
      const question = makeQuestion({ userId: 'user-1' });
      mockQuestionRepo.findOne.mockResolvedValue(question);
      mockQuestionRepo.remove.mockResolvedValue(undefined);

      await service.deleteQuestion('q-1', 'user-1', false);

      expect(mockQuestionRepo.remove).toHaveBeenCalledWith(question);
    });

    it('allows admin to delete any question', async () => {
      const question = makeQuestion({ userId: 'another-user' });
      mockQuestionRepo.findOne.mockResolvedValue(question);
      mockQuestionRepo.remove.mockResolvedValue(undefined);

      await service.deleteQuestion('q-1', 'admin-user', true);

      expect(mockQuestionRepo.remove).toHaveBeenCalledWith(question);
    });
  });

  describe('hideQuestion', () => {
    it('throws NotFoundException for unknown question', async () => {
      mockQuestionRepo.findOne.mockResolvedValue(null);

      await expect(service.hideQuestion('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('sets isHidden to true', async () => {
      const question = makeQuestion({ isHidden: false });
      mockQuestionRepo.findOne.mockResolvedValueOnce(question).mockResolvedValueOnce({ ...question, isHidden: true });
      mockQuestionRepo.update.mockResolvedValue({});

      const result = await service.hideQuestion('q-1');

      expect(mockQuestionRepo.update).toHaveBeenCalledWith('q-1', { isHidden: true });
      expect(result.isHidden).toBe(true);
    });
  });

  describe('getForProduct', () => {
    it('filters out hidden questions', async () => {
      const visible = makeQuestion({ isHidden: false });
      mockQuestionRepo.find.mockResolvedValue([visible]);

      const result = await service.getForProduct('p-1');

      expect(mockQuestionRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { productId: 'p-1', isHidden: false } }),
      );
    });
  });
});
