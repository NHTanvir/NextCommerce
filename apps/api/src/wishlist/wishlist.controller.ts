import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';

@ApiTags('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.wishlistService.findByUser(user.sub);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  add(@CurrentUser() user: UserPayload, @Param('productId') productId: string) {
    return this.wishlistService.add(user.sub, productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove product from wishlist' })
  remove(@CurrentUser() user: UserPayload, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.sub, productId);
  }

  @Post(':productId/toggle')
  @ApiOperation({ summary: 'Toggle product in wishlist' })
  toggle(@CurrentUser() user: UserPayload, @Param('productId') productId: string) {
    return this.wishlistService.toggle(user.sub, productId);
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Get wishlist statistics' })
  getAdminStats() {
    return this.wishlistService.getAdminStats();
  }

  @Get('admin/most-wishlisted')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get most wishlisted products (admin)' })
  getMostWishlisted(@Query('limit') limit?: string) {
    return this.wishlistService.getMostWishlisted(limit ? parseInt(limit, 10) : 10);
  }

  @Get('count/:productId')
  @ApiOperation({ summary: 'Get wishlist count for a product' })
  getCount(@Param('productId') productId: string) {
    return this.wishlistService.getCountForProduct(productId);
  }
}
