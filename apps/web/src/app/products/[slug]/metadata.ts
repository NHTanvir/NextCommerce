import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/api/products/${params.slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: 'Product' };
    const product = await res.json();
    return {
      title: product.title,
      description: product.description ?? `Buy ${product.title} at NextCommerce`,
      openGraph: {
        title: product.title,
        description: product.description ?? '',
        images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
      },
    };
  } catch {
    return { title: 'Product' };
  }
}
