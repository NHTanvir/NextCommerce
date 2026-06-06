import { Controller, Get, Post, Delete, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all distinct product tags' })
  findAll() {
    return this.tagsService.findAll();
  }

  @Get('products')
  @ApiQuery({ name: 'tag', required: true })
  @ApiOperation({ summary: 'Get product IDs for a given tag' })
  findProductsByTag(@Query('tag') tag: string) {
    return this.tagsService.findProductsByTag(tag);
  }

  @Post(':productId/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Add a tag to a product' })
  addTag(@Param('productId') productId: string, @Param('name') name: string) {
    return this.tagsService.addTag(productId, name);
  }

  @Delete(':productId/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Remove a tag from a product' })
  removeTag(@Param('productId') productId: string, @Param('name') name: string) {
    return this.tagsService.removeTag(productId, name);
  }

  @Get('admin/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get all tags with product counts' })
  getTagsWithCounts() {
    return this.tagsService.getTagsWithCounts();
  }

  @Delete('admin/name/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Remove a tag from all products' })
  removeTagGlobally(@Param('name') name: string) {
    return this.tagsService.removeAllTagsForName(name);
  }
}
