import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/address.dto';

@ApiTags('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List current user addresses' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.addressesService.findByUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an address' })
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.addressesService.remove(id, user.id);
  }
}
