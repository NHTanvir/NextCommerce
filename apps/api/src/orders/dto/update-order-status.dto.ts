import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUS_TRANSITIONS } from '@nextcommerce/shared';

const VALID_STATUSES = Object.keys(ORDER_STATUS_TRANSITIONS) as Array<keyof typeof ORDER_STATUS_TRANSITIONS>;

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: VALID_STATUSES })
  @IsEnum(VALID_STATUSES)
  status!: string;
}
