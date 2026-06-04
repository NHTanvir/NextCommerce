'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGetProductQuery } from '@/store/api/catalog.api';
import { useAddToCartMutation } from '@/store/api/cart.api';
import { RatingStars } from '@/components/ui/RatingStars';
import styles from './ProductQuickView.module.scss';

interface Props {
  slug: string;
  onClose: () => void;
}

export function ProductQuickView({ slug, onClose }: Props) {
  const { data: product, isLoading } = useGetProductQuery(slug);
  const [addToCart] = useAddToCartMutation();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (product?.variants?.length) {
      const first = product.variants.find((v) => v.stockQty > 0) ?? product.variants[0];
      setSelectedVariantId(first.id);
    }
  }, [product]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleAddToCart = async () => {
    if (!selectedVariantId) return;
    try {
      await addToCart({ variantId: selectedVariantId, quantity: qty }).unwrap();
      setAddedMsg('Added to cart!');
      setTimeout(() => setAddedMsg(''), 2500);
    } catch {
      setAddedMsg('Failed to add to cart.');
      setTimeout(() => setAddedMsg(''), 2500);
    }
  };

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId);
  const price = selectedVariant?.priceCents ?? product?.basePriceCents ?? 0;
  const inStock = (selectedVariant?.stockQty ?? 0) > 0;
  const images = product?.images ?? [];

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>

        {isLoading || !product ? (
          <div className={styles.loadingState}>
            <div className={styles.skeletonImg} />
            <div className={styles.skeletonContent}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonLine} style={{ width: `${80 - i * 15}%` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.content}>
            {/* Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImg}>
                {images[activeImg] ? (
                  <Image
                    src={images[activeImg].url}
                    alt={images[activeImg].alt ?? product.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                ) : (
                  <div className={styles.noImage}>
                    <span>🖼️</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className={styles.thumbs}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? ''}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="56px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.info}>
              <p className={styles.brand}>{product.brand}</p>
              <h2 className={styles.title}>{product.title}</h2>

              <div className={styles.ratingRow}>
                <RatingStars rating={product.avgRating ?? 0} size="sm" />
                <span className={styles.reviewCount}>
                  {product.reviewCount ?? 0} reviews
                </span>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.price}>${(price / 100).toFixed(2)}</span>
                {!inStock && selectedVariantId && (
                  <span className={styles.outOfStock}>Out of stock</span>
                )}
              </div>

              {/* Variant selector */}
              {product.variants && product.variants.length > 0 && (
                <div className={styles.variantSection}>
                  <p className={styles.variantLabel}>
                    Select Size / Color
                  </p>
                  <div className={styles.variants}>
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        className={`${styles.variantChip} ${v.id === selectedVariantId ? styles.variantSelected : ''} ${v.stockQty === 0 ? styles.variantOos : ''}`}
                        onClick={() => setSelectedVariantId(v.id)}
                        disabled={v.stockQty === 0}
                        title={v.stockQty === 0 ? 'Out of stock' : undefined}
                      >
                        {v.size} · {v.color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty + Add */}
              <div className={styles.addRow}>
                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <span className={styles.qtyVal}>{qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty((q) => Math.min(10, q + 1))}
                    disabled={qty >= 10}
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn btn--primary"
                  style={{ flex: 1 }}
                  onClick={handleAddToCart}
                  disabled={!inStock || !selectedVariantId}
                >
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              {addedMsg && (
                <p className={addedMsg.includes('Failed') ? styles.msgError : styles.msgSuccess}>
                  {addedMsg}
                </p>
              )}

              <Link href={`/products/${product.slug}`} className={styles.fullLink}>
                View Full Details →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
