import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from '../inventory.controller';
import { InventoryService } from '../inventory.service';
import { InventoryAlertService } from '../inventory-alert.service';

const mockInventoryService: Partial<InventoryService> = {
  getProductInventory: jest.fn().mockResolvedValue([]),
  getLowStockAlerts: jest.fn().mockResolvedValue([]),
  getStockSummary: jest.fn().mockResolvedValue({ total: 100, outOfStock: 5, low: 10, healthy: 85 }),
  adjustStock: jest.fn().mockResolvedValue({ stockQty: 15 }),
  setStock: jest.fn().mockResolvedValue({ stockQty: 20 }),
};

const mockAlertService: Partial<InventoryAlertService> = {
  getLowStockSummary: jest.fn().mockResolvedValue({ outOfStock: 2, lowStock: 5, healthy: 93 }),
  publishLowStockAlerts: jest.fn().mockResolvedValue(3),
};

describe('InventoryController', () => {
  let controller: InventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: InventoryAlertService, useValue: mockAlertService },
      ],
    }).compile();

    controller = module.get(InventoryController);
    jest.clearAllMocks();
  });

  it('getProductInventory() delegates productId', async () => {
    await controller.getProductInventory('p-1');
    expect(mockInventoryService.getProductInventory).toHaveBeenCalledWith('p-1');
  });

  it('getLowStockAlerts() uses default threshold when none provided', async () => {
    await controller.getLowStockAlerts();
    expect(mockInventoryService.getLowStockAlerts).toHaveBeenCalledWith(undefined);
  });

  it('getLowStockAlerts() parses threshold string', async () => {
    await controller.getLowStockAlerts('5');
    expect(mockInventoryService.getLowStockAlerts).toHaveBeenCalledWith(5);
  });

  it('getAlertSummary() delegates to alert service', async () => {
    await controller.getAlertSummary();
    expect(mockAlertService.getLowStockSummary).toHaveBeenCalledWith(undefined);
  });

  it('publishAlerts() wraps count in { published }', async () => {
    const result = await controller.publishAlerts();
    expect(mockAlertService.publishLowStockAlerts).toHaveBeenCalledWith(undefined);
    expect(result).toEqual({ published: 3 });
  });

  it('getStockSummary() delegates to service', async () => {
    const result = await controller.getStockSummary();
    expect(mockInventoryService.getStockSummary).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });

  it('adjustStock() delegates id and dto', async () => {
    const dto = { delta: 5 } as any;
    await controller.adjustStock('v-1', dto);
    expect(mockInventoryService.adjustStock).toHaveBeenCalledWith('v-1', dto);
  });

  it('setStock() delegates id and dto', async () => {
    const dto = { stockQty: 20 } as any;
    await controller.setStock('v-1', dto);
    expect(mockInventoryService.setStock).toHaveBeenCalledWith('v-1', dto);
  });
});
