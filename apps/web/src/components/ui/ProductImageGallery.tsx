'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './ProductImageGallery.module.scss';

interface ProductImage {
  url: string;
  alt?: string;
}

interface Props {
  images: ProductImage[];
  productTitle: string;
}

export function ProductImageGallery({ images, productTitle }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const activeImage = images[activeIndex];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, [zoomed]);

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  if (images.length === 0) {
    return (
      <div className={styles.placeholder}>
        <span className={styles.placeholderIcon}>📦</span>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {/* Main image */}
      <div
        className={`${styles.mainWrap} ${zoomed ? styles.zoomed : ''}`}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => { setZoomed(false); setZoomPos({ x: 50, y: 50 }); }}
        onMouseMove={handleMouseMove}
        onClick={() => setZoomed((z) => !z)}
      >
        <Image
          src={activeImage.url}
          alt={activeImage.alt ?? productTitle}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={styles.mainImage}
          priority
          style={
            zoomed
              ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: 'scale(2)' }
              : undefined
          }
        />

        {images.length > 1 && (
          <>
            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous image">
              ‹
            </button>
            <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image">
              ›
            </button>
            <div className={styles.dots}>
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === activeIndex ? styles.activeDot : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className={styles.zoomHint}>{zoomed ? 'Click to exit zoom' : 'Hover to zoom'}</div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, i) => (
            <button
              key={i}
              className={`${styles.thumb} ${i === activeIndex ? styles.activeThumb : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productTitle} ${i + 1}`}
                fill
                sizes="80px"
                className={styles.thumbImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
