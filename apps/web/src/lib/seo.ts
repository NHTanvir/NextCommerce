import type { Metadata } from 'next';

const SITE_NAME = 'NextCommerce';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nextcommerce.io';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

interface SEOOptions {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  path?: string;
}

export function buildMetadata({
  title,
  description = 'Premium footwear for every step. Shop Nike, Adidas, New Balance, and more at NextCommerce.',
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  path = '',
}: SEOOptions): Metadata {
  const fullTitle = `${title} — ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

export function buildProductMetadata(product: {
  title: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  priceCents?: number;
}): Metadata {
  const base = buildMetadata({
    title: product.title,
    description: product.description ?? `Buy ${product.title} at NextCommerce`,
    image: product.imageUrl ?? DEFAULT_OG_IMAGE,
    path: `/products/${product.slug}`,
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
    },
  };
}
