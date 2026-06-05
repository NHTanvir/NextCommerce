import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type SizeUnit = 'US' | 'EU' | 'UK' | 'CM';
type Gender = 'mens' | 'womens' | 'kids';

interface SizeRow {
  us: string;
  eu: string;
  uk: string;
  cm: string;
}

const MENS_SIZES: SizeRow[] = [
  { us: '6',   eu: '38.5', uk: '5.5',  cm: '24.0' },
  { us: '6.5', eu: '39',   uk: '6',    cm: '24.5' },
  { us: '7',   eu: '40',   uk: '6.5',  cm: '25.0' },
  { us: '7.5', eu: '40.5', uk: '7',    cm: '25.4' },
  { us: '8',   eu: '41',   uk: '7.5',  cm: '26.0' },
  { us: '8.5', eu: '42',   uk: '8',    cm: '26.7' },
  { us: '9',   eu: '42.5', uk: '8.5',  cm: '27.0' },
  { us: '9.5', eu: '43',   uk: '9',    cm: '27.5' },
  { us: '10',  eu: '44',   uk: '9.5',  cm: '28.0' },
  { us: '10.5',eu: '44.5', uk: '10',   cm: '28.5' },
  { us: '11',  eu: '45',   uk: '10.5', cm: '29.0' },
  { us: '11.5',eu: '45.5', uk: '11',   cm: '29.4' },
  { us: '12',  eu: '46',   uk: '11.5', cm: '30.0' },
  { us: '13',  eu: '47.5', uk: '12.5', cm: '31.0' },
];

const WOMENS_SIZES: SizeRow[] = [
  { us: '5',   eu: '35.5', uk: '3',    cm: '21.6' },
  { us: '5.5', eu: '36',   uk: '3.5',  cm: '22.0' },
  { us: '6',   eu: '36.5', uk: '4',    cm: '22.5' },
  { us: '6.5', eu: '37.5', uk: '4.5',  cm: '23.0' },
  { us: '7',   eu: '38',   uk: '5',    cm: '23.5' },
  { us: '7.5', eu: '38.5', uk: '5.5',  cm: '24.0' },
  { us: '8',   eu: '39',   uk: '6',    cm: '24.5' },
  { us: '8.5', eu: '39.5', uk: '6.5',  cm: '25.0' },
  { us: '9',   eu: '40',   uk: '7',    cm: '25.5' },
  { us: '9.5', eu: '40.5', uk: '7.5',  cm: '26.0' },
  { us: '10',  eu: '41',   uk: '8',    cm: '26.5' },
  { us: '11',  eu: '42.5', uk: '9',    cm: '27.5' },
];

const KIDS_SIZES: SizeRow[] = [
  { us: '1Y',  eu: '32',   uk: '13.5', cm: '20.0' },
  { us: '1.5Y',eu: '33',   uk: '1',    cm: '20.5' },
  { us: '2Y',  eu: '33.5', uk: '1.5',  cm: '21.0' },
  { us: '2.5Y',eu: '34',   uk: '2',    cm: '21.5' },
  { us: '3Y',  eu: '35',   uk: '2.5',  cm: '22.0' },
  { us: '3.5Y',eu: '35.5', uk: '3',    cm: '22.5' },
  { us: '4Y',  eu: '36',   uk: '3.5',  cm: '23.0' },
  { us: '4.5Y',eu: '36.5', uk: '4',    cm: '23.5' },
  { us: '5Y',  eu: '37.5', uk: '4.5',  cm: '24.0' },
  { us: '5.5Y',eu: '38',   uk: '5',    cm: '24.5' },
  { us: '6Y',  eu: '38.5', uk: '5.5',  cm: '25.0' },
  { us: '7Y',  eu: '40',   uk: '6.5',  cm: '25.5' },
];

const GENDER_DATA: Record<Gender, SizeRow[]> = {
  mens: MENS_SIZES,
  womens: WOMENS_SIZES,
  kids: KIDS_SIZES,
};

const UNITS: SizeUnit[] = ['US', 'EU', 'UK', 'CM'];

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  header: '#161b22',
};

export default function SizeGuideScreen() {
  const [gender, setGender] = useState<Gender>('mens');
  const [highlight, setHighlight] = useState<string | null>(null);

  const rows = GENDER_DATA[gender];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Gender tabs */}
      <View style={styles.tabs}>
        {(['mens', 'womens', 'kids'] as Gender[]).map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.tab, gender === g && styles.tabActive]}
            onPress={() => { setGender(g); setHighlight(null); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, gender === g && styles.tabTextActive]}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>
        Tap a US size to highlight the row
      </Text>

      {/* Table */}
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.row, styles.headerRow]}>
          {UNITS.map((u) => (
            <Text key={u} style={[styles.cell, styles.headerCell]}>{u}</Text>
          ))}
        </View>

        {/* Rows */}
        {rows.map((r) => (
          <TouchableOpacity
            key={r.us}
            style={[styles.row, highlight === r.us && styles.rowHighlighted]}
            onPress={() => setHighlight(highlight === r.us ? null : r.us)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cell, highlight === r.us && styles.cellHighlighted]}>{r.us}</Text>
            <Text style={[styles.cell, styles.mutedCell]}>{r.eu}</Text>
            <Text style={[styles.cell, styles.mutedCell]}>{r.uk}</Text>
            <Text style={[styles.cell, styles.mutedCell]}>{r.cm}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Measuring tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>How to measure</Text>
        <Text style={styles.tipText}>
          Stand on a flat surface with your heel against a wall. Mark the longest point of your foot, then measure from the wall to that mark in centimeters.
        </Text>
        <Text style={styles.tipText} style={{ marginTop: 8 }}>
          If you're between sizes, we recommend going up half a size.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
  },
  tabTextActive: {
    color: '#fff',
  },

  hint: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 12,
  },

  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    backgroundColor: COLORS.header,
  },
  rowHighlighted: {
    backgroundColor: '#2d1a22',
  },
  cell: {
    flex: 1,
    padding: 12,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mutedCell: {
    color: COLORS.muted,
    fontWeight: '400',
  },
  cellHighlighted: {
    color: COLORS.accent,
    fontWeight: '800',
  },

  tipCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
});
