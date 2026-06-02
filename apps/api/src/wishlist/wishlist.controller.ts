import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
}
