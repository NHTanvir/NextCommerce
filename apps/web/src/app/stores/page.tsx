'use client';

import { useState, useMemo } from 'react';
import styles from './stores.module.scss';

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: Record<string, string>;
  features: string[];
  isOpenNow: boolean;
}

const STORES: Store[] = [
  {
    id: 'nyc-flagship',
    name: 'NextCommerce NYC Flagship',
    address: '350 5th Ave',
    city: 'New York',
    state: 'NY',
    zip: '10118',
    phone: '+1 (212) 555-0101',
    hours: { 'Mon–Sat': '10am–9pm', 'Sunday': '11am–7pm' },
    features: ['In-store pickup', 'Try before you buy', 'VIP lounge', 'Personal styling'],
    isOpenNow: true,
  },
  {
    id: 'nyc-soho',
    name: 'NextCommerce SoHo',
    address: '128 Spring St',
    city: 'New York',
    state: 'NY',
    zip: '10012',
    phone: '+1 (212) 555-0202',
    hours: { 'Daily': '10am–8pm' },
    features: ['In-store pickup', 'Customization bar'],
    isOpenNow: true,
  },
  {
    id: 'la',
    name: 'NextCommerce Los Angeles',
    address: '8500 Beverly Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90048',
    phone: '+1 (310) 555-0303',
    hours: { 'Mon–Sat': '10am–9pm', 'Sunday': '11am–7pm' },
    features: ['In-store pickup', 'Try before you buy', 'Outdoor terrace'],
    isOpenNow: true,
  },
  {
    id: 'chicago',
    name: 'NextCommerce Chicago',
    address: '101 N Michigan Ave',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    phone: '+1 (312) 555-0404',
    hours: { 'Mon–Sat': '10am–8pm', 'Sunday': '12pm–6pm' },
    features: ['In-store pickup', 'Shoe repair service'],
    isOpenNow: false,
  },
  {
    id: 'miami',
    name: 'NextCommerce Miami Beach',
    address: '1601 Collins Ave',
    city: 'Miami Beach',
    state: 'FL',
    zip: '33139',
    phone: '+1 (305) 555-0505',
    hours: { 'Daily': '11am–9pm' },
    features: ['In-store pickup', 'Beach-ready styles'],
    isOpenNow: true,
  },
  {
    id: 'sf',
    name: 'NextCommerce San Francisco',
    address: '298 Post St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94108',
    phone: '+1 (415) 555-0606',
    hours: { 'Mon–Sat': '10am–7pm', 'Sunday': '11am–6pm' },
    features: ['In-store pickup', 'Tech-first experience', 'AR size finder'],
    isOpenNow: true,
  },
  {
    id: 'seattle',
    name: 'NextCommerce Seattle',
    address: '1501 Pike Pl',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    phone: '+1 (206) 555-0707',
    hours: { 'Mon–Sat': '9am–8pm', 'Sunday': '10am–6pm' },
    features: ['In-store pickup', 'Waterproof collection showcase'],
    isOpenNow: false,
  },
  {
    id: 'austin',
    name: 'NextCommerce Austin',
    address: '215 Congress Ave',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    phone: '+1 (512) 555-0808',
    hours: { 'Daily': '10am–9pm' },
    features: ['In-store pickup', 'Live music events', 'Café'],
    isOpenNow: true,
  },
  {
    id: 'boston',
    name: 'NextCommerce Boston',
    address: '700 Boylston St',
    city: 'Boston',
    state: 'MA',
    zip: '02116',
    phone: '+1 (617) 555-0909',
    hours: { 'Mon–Sat': '10am–8pm', 'Sunday': '12pm–6pm' },
    features: ['In-store pickup', 'University discounts'],
    isOpenNow: true,
  },
  {
    id: 'denver',
    name: 'NextCommerce Denver',
    address: '16th & Lawrence',
    city: 'Denver',
    state: 'CO',
    zip: '80202',
    phone: '+1 (720) 555-1010',
    hours: { 'Mon–Sat': '10am–7pm', 'Sunday': '11am–5pm' },
    features: ['In-store pickup', 'Outdoor/hiking specialists'],
    isOpenNow: false,
  },
];

const ALL_STATES = [...new Set(STORES.map((s) => s.state))].sort();

export default function StoresPage() {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const filtered = useMemo(() => {
    return STORES.filter((s) => {
      if (openOnly && !s.isOpenNow) return false;
      if (stateFilter && s.state !== stateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.city.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          s.zip.includes(q)
        );
      }
      return true;
    });
  }, [search, stateFilter, openOnly]);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.heroBadge}>🗺 Store Locator</span>
        <h1 className={styles.heroTitle}>Find a Store</h1>
        <p className={styles.heroSub}>
          {STORES.length} NextCommerce locations across the United States — try before you buy.
        </p>
      </div>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.sidebar}>
          <div className={styles.filterCard}>
            <div className={styles.searchField}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.searchInput}
                placeholder="City, state, or ZIP…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>State</label>
              <select
                className={styles.filterSelect}
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="">All States</option>
                {ALL_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggle} />
              Open now only
            </label>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{STORES.length}</span>
              <span className={styles.statLabel}>Total locations</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{STORES.filter((s) => s.isOpenNow).length}</span>
              <span className={styles.statLabel}>Open now</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{ALL_STATES.length}</span>
              <span className={styles.statLabel}>States</span>
            </div>
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultCount}>{filtered.length} location{filtered.length !== 1 ? 's' : ''}</span>
            {(search || stateFilter || openOnly) && (
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => { setSearch(''); setStateFilter(''); setOpenOnly(false); }}
              >
                Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <span>🏪</span>
              <p>No stores match your search.</p>
              <button className="btn btn--ghost btn--sm" onClick={() => { setSearch(''); setStateFilter(''); setOpenOnly(false); }}>
                Show all stores
              </button>
            </div>
          ) : (
            <div className={styles.storeGrid}>
              {filtered.map((store) => (
                <div
                  key={store.id}
                  className={`${styles.storeCard} ${selectedStore?.id === store.id ? styles.storeCardSelected : ''}`}
                  onClick={() => setSelectedStore(store.id === selectedStore?.id ? null : store)}
                >
                  <div className={styles.storeCardHeader}>
                    <div>
                      <h3 className={styles.storeName}>{store.name}</h3>
                      <p className={styles.storeAddress}>{store.address}, {store.city}, {store.state} {store.zip}</p>
                    </div>
                    <span className={`${styles.openBadge} ${store.isOpenNow ? styles.openBadgeOpen : styles.openBadgeClosed}`}>
                      {store.isOpenNow ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <div className={styles.storeInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoIcon}>📞</span>
                      <a href={`tel:${store.phone}`} className={styles.phoneLink}>{store.phone}</a>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoIcon}>🕐</span>
                      <div>
                        {Object.entries(store.hours).map(([days, time]) => (
                          <p key={days} className={styles.hoursLine}>{days}: {time}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedStore?.id === store.id && (
                    <div className={styles.storeExpanded}>
                      <p className={styles.featuresLabel}>Services & features</p>
                      <div className={styles.featureTags}>
                        {store.features.map((f) => (
                          <span key={f} className={styles.featureTag}>{f}</span>
                        ))}
                      </div>
                      <div className={styles.storeActions}>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(`${store.address}, ${store.city}, ${store.state}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--primary btn--sm"
                        >
                          Get Directions ↗
                        </a>
                        <a href={`tel:${store.phone}`} className="btn btn--ghost btn--sm">
                          Call Store
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
