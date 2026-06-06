'use client';

import Link from 'next/link';
import { useGetCatalogHealthQuery } from '@/store/api/catalog.api';
import styles from '../admin.module.scss';

interface HealthIssue {
  label: string;
  count: number;
  color: string;
  description: string;
  fixLink: string;
}

export default function AdminCatalogHealthPage() {
  const { data: health, isLoading, refetch } = useGetCatalogHealthQuery();

  const issues: HealthIssue[] = health
    ? [
        {
          label: 'Missing Images',
          count: health.noImages,
          color: '#e94560',
          description: 'Products with no images uploaded',
          fixLink: '/admin/products',
        },
        {
          label: 'No Description',
          count: health.noDescription,
          color: '#f59e0b',
          description: 'Products missing a product description',
          fixLink: '/admin/products',
        },
        {
          label: 'No Variants',
          count: health.noVariants,
          color: '#8b5cf6',
          description: 'Products with no size/color variants',
          fixLink: '/admin/products',
        },
        {
          label: 'Out of Stock',
          count: health.outOfStock,
          color: '#f59e0b',
          description: 'Active products with zero stock across all variants',
          fixLink: '/admin/inventory',
        },
        {
          label: 'Missing Category',
          count: health.missingCategory,
          color: '#e94560',
          description: 'Products not assigned to a category',
          fixLink: '/admin/products',
        },
      ]
    : [];

  const totalIssues = issues.reduce((sum, i) => sum + i.count, 0);
  const score = health ? Math.round(((health.total - totalIssues) / Math.max(health.total, 1)) * 100) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Catalog Health</h1>
          <p className={styles.pageSub}>Identify and fix data quality issues in your product catalog.</p>
        </div>
        <button className="btn btn--outline btn--sm" onClick={() => refetch()}>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading health data…</p>
      ) : health ? (
        <>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{health.total.toLocaleString()}</span>
              <span className={styles.statLabel}>Total Products</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{health.active.toLocaleString()}</span>
              <span className={styles.statLabel}>Active</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue} style={{ color: score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#e94560' }}>
                {score}%
              </span>
              <span className={styles.statLabel}>Health Score</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue} style={{ color: totalIssues > 0 ? '#e94560' : '#10b981' }}>
                {totalIssues}
              </span>
              <span className={styles.statLabel}>Total Issues</span>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Issues Breakdown</h2>
            <div className={styles.issueList}>
              {issues.map((issue) => (
                <div key={issue.label} className={styles.issueRow}>
                  <div className={styles.issueInfo}>
                    <span className={styles.issueName}>{issue.label}</span>
                    <span className={styles.issueDesc}>{issue.description}</span>
                  </div>
                  <div className={styles.issueCount} style={{ color: issue.count > 0 ? issue.color : '#10b981' }}>
                    {issue.count > 0 ? `${issue.count} products` : '✓ All good'}
                  </div>
                  {issue.count > 0 && (
                    <Link href={issue.fixLink} className="btn btn--outline btn--sm">
                      Fix →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--color-text-muted)' }}>Failed to load health data.</p>
      )}
    </div>
  );
}
