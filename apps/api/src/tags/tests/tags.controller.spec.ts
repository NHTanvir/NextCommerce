import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from '../tags.controller';
import { TagsService } from '../tags.service';

const mockService: Partial<TagsService> = {
  findAll: jest.fn().mockResolvedValue(['new-arrival', 'sale', 'featured']),
  findProductsByTag: jest.fn().mockResolvedValue(['p-1', 'p-2']),
  addTag: jest.fn().mockResolvedValue({ productId: 'p-1', name: 'sale' }),
  removeTag: jest.fn().mockResolvedValue(undefined),
  getTagsWithCounts: jest.fn().mockResolvedValue([{ name: 'sale', productCount: 5 }]),
  removeAllTagsForName: jest.fn().mockResolvedValue({ removed: 5 }),
};

describe('TagsController', () => {
  let controller: TagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [{ provide: TagsService, useValue: mockService }],
    }).compile();

    controller = module.get(TagsController);
    jest.clearAllMocks();
  });

  it('findAll() returns all distinct tags', async () => {
    const result = await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
    expect(result).toEqual(['new-arrival', 'sale', 'featured']);
  });

  it('findProductsByTag() delegates with tag param', async () => {
    await controller.findProductsByTag('sale');
    expect(mockService.findProductsByTag).toHaveBeenCalledWith('sale');
  });

  it('addTag() delegates with productId and tag name', async () => {
    await controller.addTag('p-1', 'featured');
    expect(mockService.addTag).toHaveBeenCalledWith('p-1', 'featured');
  });

  it('removeTag() delegates with productId and tag name', async () => {
    await controller.removeTag('p-1', 'featured');
    expect(mockService.removeTag).toHaveBeenCalledWith('p-1', 'featured');
  });

  it('getTagsWithCounts() delegates to service', async () => {
    const result = await controller.getTagsWithCounts();
    expect(mockService.getTagsWithCounts).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('removeTagGlobally() delegates with tag name', async () => {
    await controller.removeTagGlobally('sale');
    expect(mockService.removeAllTagsForName).toHaveBeenCalledWith('sale');
  });
});
