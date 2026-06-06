import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/types';
import { fetchTags as apiFetchTags } from '@/api/catalog';

type Nav = NativeStackNavigationProp<ShopStackParamList>;

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
};

const TAG_PALETTE = [
  '#e94560', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ef4444', '#22c55e', '#a855f7', '#f97316',
  '#14b8a6', '#6366f1', '#ec4899', '#84cc16', '#0ea5e9',
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
}

interface TagSection {
  letter: string;
  data: string[];
}

export default function TagsScreen() {
  const navigation = useNavigation<Nav>();
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'cloud' | 'list'>('cloud');

  useEffect(() => {
    apiFetchTags()
      .then((data) => setTags(data))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? tags.filter((t) => t.toLowerCase().includes(q)) : tags;
  }, [tags, search]);

  const sections: TagSection[] = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.localeCompare(b));
    const map = new Map<string, string[]>();
    for (const tag of sorted) {
      const letter = tag[0]?.toUpperCase() ?? '#';
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(tag);
    }
    return Array.from(map.entries()).map(([letter, data]) => ({ letter, data }));
  }, [filtered]);

  const handleTagPress = (tag: string) => {
    (navigation as any).navigate('ProductList', { tag });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🏷️</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tags…"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* View toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'cloud' && styles.toggleBtnActive]}
          onPress={() => setView('cloud')}
        >
          <Text style={[styles.toggleText, view === 'cloud' && styles.toggleTextActive]}>Cloud</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'list' && styles.toggleBtnActive]}
          onPress={() => setView('list')}
        >
          <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>A–Z List</Text>
        </TouchableOpacity>
        <Text style={styles.count}>{filtered.length} tags</Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏷️</Text>
          <Text style={styles.emptyText}>
            {search ? `No tags matching "${search}"` : 'No tags yet.'}
          </Text>
        </View>
      ) : view === 'cloud' ? (
        <FlatList
          contentContainerStyle={styles.cloud}
          data={[{ key: 'cloud' }]}
          keyExtractor={(i) => i.key}
          renderItem={() => (
            <View style={styles.cloudInner}>
              {filtered.map((tag) => {
                const color = getTagColor(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagChip,
                      {
                        borderColor: color + '60',
                        backgroundColor: color + '18',
                      },
                    ]}
                    onPress={() => handleTagPress(tag)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tagChipText, { color }]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(s) => s.letter}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: section }) => (
            <View style={styles.section}>
              <Text style={styles.sectionLetter}>{section.letter}</Text>
              {section.data.map((tag) => {
                const color = getTagColor(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={styles.listItem}
                    onPress={() => handleTagPress(tag)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={styles.listItemText}>{tag}</Text>
                    <Text style={[styles.listArrow, { color }]}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 11,
  },
  clearBtn: { color: COLORS.muted, fontSize: 14, padding: 4 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 8,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  toggleBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  toggleText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  count: { marginLeft: 'auto', fontSize: 12, color: COLORS.muted },

  cloud: { paddingBottom: 32 },
  cloudInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagChipText: { fontSize: 13, fontWeight: '600' },

  listContent: { paddingBottom: 32 },
  section: { marginBottom: 4 },
  sectionLetter: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#0d1117',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  listItemText: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: '500' },
  listArrow: { fontSize: 20, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: COLORS.muted, fontSize: 15, textAlign: 'center' },
});
