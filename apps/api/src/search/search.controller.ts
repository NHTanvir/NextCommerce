import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Full-text product and category search' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default 20)' })
  search(
    @Query('q') q: string = '',
    @Query('limit') limit?: string,
  ) {
    return this.searchService.search(q, limit ? parseInt(limit, 10) : 20);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Search autocomplete suggestions' })
  @ApiQuery({ name: 'q', required: true, description: 'Partial query' })
  autocomplete(@Query('q') q: string = '') {
    return this.searchService.autocomplete(q);
  }
}
