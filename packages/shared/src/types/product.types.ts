export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductVariantDto {
  id: string;
  size: number;
  color: string;
  sku: string;
  stockQty: number;
  priceCents: number;
}

export interface ProductDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  brand: string;
  basePriceCents: number;
  categoryId: string;
  categoryName?: string;
  images: ProductImage[];
  variants: ProductVariantDto[];
  isActive: boolean;
  createdAt: string;
}

export interface CategoryDto {
  id: string;
  slug: string;
  name: string;
  children?: CategoryDto[];
}

export interface ProductListResponse {
  data: ProductDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
