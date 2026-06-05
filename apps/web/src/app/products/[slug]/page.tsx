'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useGetProductQuery } from '@/store/api/catalog.api';
import { useAddToCartMutation } from '@/store/api/cart.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem, setCartOpen } from '@/store/slices/cart.slice';
import { RelatedProducts } from '@/components/features/RelatedProducts';
import { ProductReviews } from '@/components/features/ProductReviews';
import { ProductSpecifications } from '@/components/features/ProductSpecifications';
import { ProductQnA } from '@/components/features/ProductQnA';
import { BackInStockButton } from '@/components/features/BackInStockButton';
import { PriceAlertButton } from '@/components/features/PriceAlertButton';
import { SizeGuide } from '@/components/features/SizeGuide';
import styles from './product.module.scss';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const anonymousToken = useAppSelector((s) => s.cart.anonymousToken);

  const { data: product, isLoading } = useGetProductQuery(slug);
  const [addToCartApi] = useAddToCartMutation();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);

  if (isLoading) {
    return (
      <div className={`container ${styles.skeleton}`}>
        <div className={styles.skeletonImg} />
        <div className={styles.skeletonInfo}>
          <div className={styles.skeletonLine} style={{ width: '60%', height: 32 }} />
          <div className={styles.skeletonLine} style={{ width: '30%', height: 24 }} />
          <div className={styles.skeletonLine} style={{ width: '80%' }} />
          <div className={styles.skeletonLine} style={{ width: '70%' }} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`container ${styles.notFound}`}>
        <h1>Product not found</h1>
      </div>
    );
  }

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) ?? null;
  const price = selectedVariant?.priceCents ?? product.variants?.[0]?.priceCents ?? 0;
  const inStock = selectedVariant ? selectedVariant.stockQty > 0 : true;

  const uniqueColors = [...new Set(product.variants?.map((v) => v.color) ?? [])];
  const uniqueSizes = [...new Set(product.variants?.map((v) => v.size) ?? [])].sort((a, b) => a - b);

  async function handleAddToCart() {
    if (!selectedVariantId) return;
    setAdding(true);
    try {
      await addToCartApi({ variantId: selectedVariantId, quantity: qty, anonymousToken: anonymousToken ?? undefined });
      dispatch(addItem({
        variantId: selectedVariantId,
        productId: product!.id,
        title: product!.title,
        slug: product!.slug,
        size: selectedVariant?.size ?? 0,
        color: selectedVariant?.color ?? '',
        priceCents: price,
        quantity: qty,
        imageUrl: product!.images?.[0]?.url ?? '',
      }));
      dispatch(setCartOpen(true));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className={`container ${styles.page}`}>
      {/* Images */}
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          {product.images?.[imageIdx]?.url ? (
            <Image
              src={product.images[imageIdx].url}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.img}
              priority
            />
          ) : (
            <div className={styles.imgPlaceholder}>👟</div>
          )}
        </div>
        {product.images && product.images.length > 1 && (
          <div className={styles.thumbnails}>
            {product.images.map((img, i) => (
              <button
                key={i}
                className={`${styles.thumb} ${i === imageIdx ? styles.thumbActive : ''}`}
                onClick={() => setImageIdx(i)}
              >
                <Image src={img.url} alt="" fill sizes="80px" className={styles.thumbImg} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        {product.brand && <span className={styles.brand}>{product.brand}</span>}
        <h1 className={styles.title}>{product.title}</h1>
        <div className={styles.price}>${(price / 100).toFixed(2)}</div>

        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}

        {uniqueColors.length > 0 && (
          <div className={styles.variantGroup}>
            <p className={styles.variantLabel}>Color</p>
            <div className={styles.colorOptions}>
              {uniqueColors.map((color) => (
                <button
                  key={color}
                  className={`${styles.colorBtn} ${selectedVariant?.color === color ? styles.selected : ''}`}
                  onClick={() => {
                    const v = product.variants?.find((v) => v.color === color);
                    if (v) setSelectedVariantId(v.id);
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {uniqueSizes.length > 0 && (
          <div className={styles.variantGroup}>
            <p className={styles.variantLabel}>Size (US)</p>
            <div className={styles.sizeOptions}>
              {uniqueSizes.map((size) => {
                const variant = product.variants?.find((v) => v.size === size);
                const outOfStock = variant?.stockQty === 0;
                return (
                  <button
                    key={size}
                    disabled={outOfStock}
                    className={`${styles.sizeBtn} ${selectedVariant?.size === size ? styles.selected : ''} ${outOfStock ? styles.oos : ''}`}
                    onClick={() => variant && setSelectedVariantId(variant.id)}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.qtyRow}>
          <p className={styles.variantLabel}>Quantity</p>
          <div className={styles.qtyControl}>
            <button className={styles.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span className={styles.qtyValue}>{qty}</span>
            <button className={styles.qtyBtn} onClick={() => setQty((q) => q + 1)}>+</button>
          </div>
        </div>

        {inStock ? (
          <button
            className={`btn btn--primary btn--lg ${styles.addBtn}`}
            onClick={handleAddToCart}
            disabled={!selectedVariantId || adding}
          >
            {adding ? 'Adding…' : !selectedVariantId ? 'Select a size' : 'Add to Cart'}
          </button>
        ) : (
          <div className={styles.outOfStockActions}>
            <button className={`btn btn--lg ${styles.addBtn}`} disabled>
              Out of Stock
            </button>
            {selectedVariantId && (
              <BackInStockButton
                productId={product.id}
                variantId={selectedVariantId}
                productTitle={product.title}
              />
            )}
          </div>
        )}

        <div className={styles.productActions}>
          <PriceAlertButton
            productId={product.id}
            currentPriceCents={price}
            productTitle={product.title}
          />
          <SizeGuide />
        </div>
      </div>

      {/* Product details tabs */}
      <div className={styles.detailsSection}>
        <ProductSpecifications productId={product.id} />
      </div>

      {/* Reviews */}
      <div className={styles.reviewsSection}>
        <ProductReviews productId={product.id} />
      </div>

      {/* Q&A */}
      <div className={styles.qnaSection}>
        <ProductQnA productId={product.id} />
      </div>

      {/* Related products */}
      <RelatedProducts productId={product.id} />
    </div>
  );
}
