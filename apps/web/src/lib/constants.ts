export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;
export const SHIPPING_COST_CENTS = 799;
export const MAX_CART_QUANTITY = 99;
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_REVIEW_LENGTH = 500;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_BADGE_VARIANT: Record<string, string> = {
  pending: 'warning',
  paid: 'info',
  processing: 'info',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'accent',
  refunded: 'neutral',
};

export const SHOE_SIZES_US = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14];

export const MAX_COMPARE_PRODUCTS = 4;
export const REVIEWS_PER_PAGE = 10;
export const PRODUCTS_PER_PAGE = 20;

export const BRAND_NAMES = [
  'Nike',
  'Adidas',
  'New Balance',
  'Puma',
  'Reebok',
  'Under Armour',
  'Asics',
  'Saucony',
  'Brooks',
  'Hoka',
] as const;

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/nextcommerce',
  instagram: 'https://instagram.com/nextcommerce',
  facebook: 'https://facebook.com/nextcommerce',
  github: 'https://github.com/NHTanvir/NextCommerce',
} as const;
