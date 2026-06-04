'use client';

import { useGetGroupedSpecsQuery } from '@/store/api/product-specs.api';
import styles from './ProductSpecifications.module.scss';

interface Props {
  productId: string;
}

export function ProductSpecifications({ productId }: Props) {
  const { data: grouped, isLoading } = useGetGroupedSpecsQuery(productId);

  if (isLoading) return null;
  if (!grouped || Object.keys(grouped).length === 0) return null;

  const groups = Object.entries(grouped);

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Specifications</h3>
      <div className={styles.groups}>
        {groups.map(([group, specs]) => (
          <div key={group} className={styles.group}>
            {groups.length > 1 && <h4 className={styles.groupName}>{group}</h4>}
            <table className={styles.table}>
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.id} className={styles.row}>
                    <td className={styles.key}>{spec.key}</td>
                    <td className={styles.value}>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
}
