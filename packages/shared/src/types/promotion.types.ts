export type DiscountType = 'percentage' | 'fixed';
export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'inactive';

export interface PromotionDto {
  id: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  applicableCategories: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyPromotionResult {
  valid: boolean;
  discountAmountCents: number;
  message?: string;
}

export function getPromotionStatus(promo: Pick<PromotionDto, 'isActive' | 'startsAt' | 'endsAt'>): PromotionStatus {
  if (!promo.isActive) return 'inactive';
  const now = new Date();
  if (new Date(promo.startsAt) > now) return 'scheduled';
  if (new Date(promo.endsAt) < now) return 'expired';
  return 'active';
}
