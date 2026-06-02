import { IsUUID, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ReturnReason, ReturnStatus } from '../entities/return-request.entity';

export class CreateReturnDto {
  @IsUUID()
  orderId!: string;

  @IsEnum(['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'other'])
  reason!: ReturnReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateReturnStatusDto {
  @IsEnum(['pending', 'approved', 'rejected', 'completed'])
  status!: ReturnStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}
