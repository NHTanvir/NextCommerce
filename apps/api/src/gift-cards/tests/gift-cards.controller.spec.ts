import { Test, TestingModule } from '@nestjs/testing';
import { GiftCardsController } from '../gift-cards.controller';
import { GiftCardsService } from '../gift-cards.service';
import type { UserPayload } from '@nextcommerce/shared';

const user: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };

const mockCard = { id: 'gc-1', code: 'GIFT50', balanceCents: 5000, isActive: true };

const mockService: Partial<GiftCardsService> = {
  getBalance: jest.fn().mockResolvedValue({ code: 'GIFT50', balanceCents: 5000, isActive: true }),
  purchase: jest.fn().mockResolvedValue(mockCard),
  findByUser: jest.fn().mockResolvedValue([mockCard]),
  applyToOrder: jest.fn().mockResolvedValue({ appliedCents: 5000, remainingBalance: 0 }),
  findAll: jest.fn().mockResolvedValue({ data: [mockCard], total: 1 }),
  getStats: jest.fn().mockResolvedValue({ total: 10, active: 8, totalValueCents: 50000 }),
  deactivate: jest.fn().mockResolvedValue({ ...mockCard, isActive: false }),
};

describe('GiftCardsController', () => {
  let controller: GiftCardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiftCardsController],
      providers: [{ provide: GiftCardsService, useValue: mockService }],
    }).compile();

    controller = module.get(GiftCardsController);
    jest.clearAllMocks();
  });

  it('getBalance() delegates code to service', async () => {
    await controller.getBalance('GIFT50');
    expect(mockService.getBalance).toHaveBeenCalledWith('GIFT50');
  });

  it('purchase() delegates user sub and dto', async () => {
    const dto = { valueCents: 5000, recipientEmail: 'gift@test.com' } as any;
    await controller.purchase(dto, user);
    expect(mockService.purchase).toHaveBeenCalledWith('user-1', dto);
  });

  it('myCards() delegates user sub', async () => {
    await controller.myCards(user);
    expect(mockService.findByUser).toHaveBeenCalledWith('user-1');
  });

  it('apply() delegates code, user sub, and amount', async () => {
    await controller.apply({ code: 'GIFT50', orderAmountCents: 10000 }, user);
    expect(mockService.applyToOrder).toHaveBeenCalledWith('GIFT50', 'user-1', 10000);
  });

  it('findAll() uses default page and limit', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalledWith(1, 20);
  });

  it('findAll() parses page and limit strings', async () => {
    await controller.findAll('3', '50');
    expect(mockService.findAll).toHaveBeenCalledWith(3, 50);
  });

  it('getStats() delegates to service', async () => {
    const result = await controller.getStats();
    expect(mockService.getStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });

  it('deactivate() delegates card id', async () => {
    const result = await controller.deactivate('gc-1');
    expect(mockService.deactivate).toHaveBeenCalledWith('gc-1');
    expect((result as any).isActive).toBe(false);
  });
});
