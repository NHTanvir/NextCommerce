import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Headers, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto, MergeCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get or create cart (user or anonymous)' })
  @ApiHeader({ name: 'x-cart-token', required: false })
  async getCart(
    @Headers('authorization') auth: string | undefined,
    @Headers('x-cart-token') token: string | undefined,
  ) {
    return this.cartService.getOrCreate(undefined, token);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiHeader({ name: 'x-cart-token', required: false })
  addItem(
    @Body() dto: AddCartItemDto,
    @Headers('x-cart-token') token: string | undefined,
  ) {
    return this.cartService.getOrCreate(undefined, token).then((cart) =>
      this.cartService.addItem(cart.id, dto),
    );
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity (0 removes it)' })
  @ApiHeader({ name: 'x-cart-token', required: false })
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Headers('x-cart-token') token: string | undefined,
  ) {
    return this.cartService.getOrCreate(undefined, token).then((cart) =>
      this.cartService.updateItem(cart.id, itemId, dto),
    );
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiHeader({ name: 'x-cart-token', required: false })
  removeItem(
    @Param('itemId') itemId: string,
    @Headers('x-cart-token') token: string | undefined,
  ) {
    return this.cartService.getOrCreate(undefined, token).then((cart) =>
      this.cartService.removeItem(cart.id, itemId),
    );
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Merge anonymous cart into user cart after login' })
  mergeCart(
    @Body() dto: MergeCartDto,
    @CurrentUser() user: UserPayload,
  ) {
    if (!dto.anonymousToken) return this.cartService.getOrCreate(user.sub);
    return this.cartService.mergeAnonymousCart(user.sub, dto.anonymousToken);
  }
}
