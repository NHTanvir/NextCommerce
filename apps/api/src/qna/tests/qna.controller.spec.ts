import { Test, TestingModule } from '@nestjs/testing';
import { QnaController } from '../qna.controller';
import { QnaService } from '../qna.service';
import type { UserPayload } from '@nextcommerce/shared';

const adminUser: UserPayload = { sub: 'admin-1', email: 'admin@test.com', role: 'admin' };
const regularUser: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };

const mockQuestion = { id: 'q-1', productId: 'p-1', question: 'Does it run big?', answer: null, isHidden: false };

const mockService: Partial<QnaService> = {
  getForProduct: jest.fn().mockResolvedValue([mockQuestion]),
  askQuestion: jest.fn().mockResolvedValue(mockQuestion),
  answerQuestion: jest.fn().mockResolvedValue({ ...mockQuestion, answer: 'Yes it does.' }),
  deleteQuestion: jest.fn().mockResolvedValue(undefined),
  hideQuestion: jest.fn().mockResolvedValue({ ...mockQuestion, isHidden: true }),
  getStats: jest.fn().mockResolvedValue({ total: 10, answered: 7, unanswered: 3 }),
  findAllForAdmin: jest.fn().mockResolvedValue({ data: [mockQuestion], total: 1 }),
};

describe('QnaController', () => {
  let controller: QnaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QnaController],
      providers: [{ provide: QnaService, useValue: mockService }],
    }).compile();

    controller = module.get(QnaController);
    jest.clearAllMocks();
  });

  it('getForProduct() delegates with productId', async () => {
    await controller.getForProduct('p-1');
    expect(mockService.getForProduct).toHaveBeenCalledWith('p-1');
  });

  it('ask() passes user sub', async () => {
    const dto = { productId: 'p-1', question: 'Fits wide feet?' } as any;
    await controller.ask(dto, regularUser);
    expect(mockService.askQuestion).toHaveBeenCalledWith('user-1', dto);
  });

  it('answer() passes isAdmin=true for admin user', async () => {
    const dto = { answer: 'Yes it does.' } as any;
    await controller.answer('q-1', dto, adminUser);
    expect(mockService.answerQuestion).toHaveBeenCalledWith('q-1', 'admin-1', dto, true);
  });

  it('answer() passes isAdmin=false for regular user', async () => {
    const dto = { answer: 'Not sure.' } as any;
    await controller.answer('q-1', dto, regularUser);
    expect(mockService.answerQuestion).toHaveBeenCalledWith('q-1', 'user-1', dto, false);
  });

  it('deleteQuestion() passes isAdmin flag', async () => {
    await controller.deleteQuestion('q-1', adminUser);
    expect(mockService.deleteQuestion).toHaveBeenCalledWith('q-1', 'admin-1', true);
  });

  it('hideQuestion() delegates to service', async () => {
    const result = await controller.hideQuestion('q-1');
    expect(mockService.hideQuestion).toHaveBeenCalledWith('q-1');
    expect((result as any).isHidden).toBe(true);
  });

  it('getStats() delegates to service', async () => {
    const result = await controller.getStats();
    expect(mockService.getStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });

  it('findAll() uses default page and limit', async () => {
    await controller.findAll();
    expect(mockService.findAllForAdmin).toHaveBeenCalledWith(1, 20);
  });

  it('findAll() parses page and limit strings', async () => {
    await controller.findAll('2', '10');
    expect(mockService.findAllForAdmin).toHaveBeenCalledWith(2, 10);
  });
});
