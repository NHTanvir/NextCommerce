import { getPromotionStatus, type PromotionDto } from '../types/promotion.types';

function makePromo(overrides: Partial<Pick<PromotionDto, 'isActive' | 'startsAt' | 'endsAt'>>): Pick<PromotionDto, 'isActive' | 'startsAt' | 'endsAt'> {
  const now = new Date();
  const past = new Date(now.getTime() - 86400000).toISOString();
  const future = new Date(now.getTime() + 86400000).toISOString();
  return {
    isActive: true,
    startsAt: past,
    endsAt: future,
    ...overrides,
  };
}

describe('getPromotionStatus', () => {
  it('returns "inactive" when isActive is false', () => {
    expect(getPromotionStatus(makePromo({ isActive: false }))).toBe('inactive');
  });

  it('returns "scheduled" when starts in the future', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(getPromotionStatus(makePromo({ startsAt: future }))).toBe('scheduled');
  });

  it('returns "expired" when endsAt is in the past', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(getPromotionStatus(makePromo({ endsAt: past }))).toBe('expired');
  });

  it('returns "active" for currently running promotion', () => {
    expect(getPromotionStatus(makePromo({}))).toBe('active');
  });
});
