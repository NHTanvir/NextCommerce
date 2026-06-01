'use client';

import { useState, ReactNode } from 'react';
import styles from './Tabs.module.scss';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const handleSelect = (id: string) => {
    setActiveId(id);
    onChange?.(id);
  };

  const active = tabs.find((t) => t.id === activeId);

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            className={`${styles.tab} ${tab.id === activeId ? styles.active : ''}`}
            onClick={() => handleSelect(tab.id)}
            type="button"
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className={styles.badge}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        aria-labelledby={activeId}
        className={styles.panel}
      >
        {active?.content}
      </div>
    </div>
  );
}
