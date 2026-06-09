import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from '../search.controller';
import { SearchService } from '../search.service';

const mockService: Partial<SearchService> = {
  search: jest.fn().mockResolvedValue({ query: '', total: 0, results: [] }),
  autocomplete: jest.fn().mockResolvedValue([]),
  getTrendingSearches: jest.fn().mockResolvedValue([]),
  searchByBrand: jest.fn().mockResolvedValue({ query: '', total: 0, results: [] }),
};

describe('SearchController', () => {
  let controller: SearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockService }],
    }).compile();

    controller = module.get(SearchController);
    jest.clearAllMocks();
  });

  it('search() delegates to service with default limit', async () => {
    await controller.search('shoes');
    expect(mockService.search).toHaveBeenCalledWith('shoes', 20);
  });

  it('search() parses limit string', async () => {
    await controller.search('boots', '10');
    expect(mockService.search).toHaveBeenCalledWith('boots', 10);
  });

  it('search() uses empty string when no query given', async () => {
    await controller.search(undefined as any);
    expect(mockService.search).toHaveBeenCalledWith('', 20);
  });

  it('autocomplete() delegates to service', async () => {
    await controller.autocomplete('air');
    expect(mockService.autocomplete).toHaveBeenCalledWith('air');
  });

  it('trending() uses default limit of 8', async () => {
    await controller.trending(undefined);
    expect(mockService.getTrendingSearches).toHaveBeenCalledWith(8);
  });

  it('trending() caps at 20 via Math.min in service call', async () => {
    await controller.trending('50');
    expect(mockService.getTrendingSearches).toHaveBeenCalledWith(20);
  });

  it('trending() passes valid limit through', async () => {
    await controller.trending('5');
    expect(mockService.getTrendingSearches).toHaveBeenCalledWith(5);
  });

  it('searchByBrand() delegates with default limit', async () => {
    await controller.searchByBrand('Nike');
    expect(mockService.searchByBrand).toHaveBeenCalledWith('Nike', 20);
  });

  it('searchByBrand() parses limit string', async () => {
    await controller.searchByBrand('Adidas', '15');
    expect(mockService.searchByBrand).toHaveBeenCalledWith('Adidas', 15);
  });
});
