import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto, UpdateReturnStatusDto } from './dto/return.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';
import type { ReturnStatus } from './entities/return-request.entity';

@ApiTags('returns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a return request for a delivered order' })
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user return requests' })
  findMine(@CurrentUser() user: UserPayload) {
    return this.returnsService.findByUser(user.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiQuery({ name: 'status', required: false })
  @ApiOperation({ summary: '[Admin] List all return requests' })
  findAll(@Query('status') status?: ReturnStatus) {
    return this.returnsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific return request' })
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.returnsService.findOne(id, user.role === 'admin' ? undefined : user.sub);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Update return request status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReturnStatusDto) {
    return this.returnsService.updateStatus(id, dto);
  }
}
