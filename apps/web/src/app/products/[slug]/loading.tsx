import styles from './product.module.scss';

export default function ProductLoading() {
  return (
    <div className={`container ${styles.skeleton}`}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonInfo}>
        <div className={styles.skeletonLine} style={{ width: '40%', height: 14 }} />
        <div className={styles.skeletonLine} style={{ width: '75%', height: 36 }} />
        <div className={styles.skeletonLine} style={{ width: '30%', height: 28 }} />
        <div className={styles.skeletonLine} style={{ width: '90%' }} />
        <div className={styles.skeletonLine} style={{ width: '80%' }} />
        <div className={styles.skeletonLine} style={{ width: '60%', height: 44, marginTop: '1rem' }} />
        <div className={styles.skeletonLine} style={{ width: '100%', height: 52, marginTop: '0.5rem' }} />
      </div>
    </div>
  );
}
