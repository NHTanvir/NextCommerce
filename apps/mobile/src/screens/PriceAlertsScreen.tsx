import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  green: '#3fb950',
  blue: '#58a6ff',
  yellow: '#f0b72f',
  overlay: 'rgba(0,0,0,0.75)',
};

interface PriceAlert {
  id: string;
  productId: string;
  targetPriceCents: number | null;
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  product?: {
    title: string;
    brand: string;
    basePriceCents: number;
    salePriceCents?: number | null;
    slug: string;
  };
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) return 'just now';
    return `${hours}h ago`;
  }
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function AlertCard({
  alert,
  onDelete,
  onEdit,
}: {
  alert: PriceAlert;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const currentPrice = alert.product?.salePriceCents ?? alert.product?.basePriceCents ?? 0;
  const targetMet = alert.targetPriceCents !== null && currentPrice <= alert.targetPriceCents;
  const savings = alert.product?.basePriceCents
    ? alert.product.basePriceCents - currentPrice
    : 0;
  const discountPct = alert.product?.basePriceCents && savings > 0
    ? Math.round((savings / alert.product.basePriceCents) * 100)
    : 0;

  return (
    <View style={[styles.card, !alert.isActive && styles.cardInactive]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {alert.product?.title ?? 'Unknown Product'}
          </Text>
          <Text style={styles.brandText}>{alert.product?.brand ?? ''}</Text>
        </View>
        <View style={styles.cardRight}>
          {targetMet && (
            <View style={styles.triggeredBadge}>
              <Text style={styles.triggeredText}>🎯 Target Met!</Text>
            </View>
          )}
          {!alert.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Paused</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.priceRow}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Current</Text>
          <Text style={[styles.priceValue, discountPct > 0 && styles.salePrice]}>
            {formatPrice(currentPrice)}
          </Text>
          {discountPct > 0 && (
            <Text style={styles.discountBadge}>{discountPct}% off</Text>
          )}
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Your Target</Text>
          <Text style={[styles.priceValue, styles.targetPrice]}>
            {alert.targetPriceCents !== null ? formatPrice(alert.targetPriceCents) : 'Any drop'}
          </Text>
        </View>
        {alert.lastTriggeredAt && (
          <>
            <View style={styles.priceDivider} />
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Last Triggered</Text>
              <Text style={styles.priceValueSmall}>{timeAgo(alert.lastTriggeredAt)}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.createdText}>Set {timeAgo(alert.createdAt)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Text style={styles.deleteBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface EditModalProps {
  visible: boolean;
  alert: PriceAlert | null;
  onClose: () => void;
  onSave: (targetCents: number | null) => void;
  saving: boolean;
}

function EditModal({ visible, alert, onClose, onSave, saving }: EditModalProps) {
  const [value, setValue] = useState('');

  React.useEffect(() => {
    if (alert) {
      setValue(alert.targetPriceCents !== null ? String(alert.targetPriceCents / 100) : '');
    }
  }, [alert]);

  const currentPrice = alert?.product?.salePriceCents ?? alert?.product?.basePriceCents ?? 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Edit Price Alert</Text>
          {alert?.product && (
            <Text style={styles.modalProduct} numberOfLines={2}>{alert.product.title}</Text>
          )}
          <Text style={styles.modalCurrent}>
            Current price: {formatPrice(currentPrice)}
          </Text>
          <Text style={styles.inputLabel}>Target price (USD) — leave blank to alert on any drop</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="e.g. 49.99"
            placeholderTextColor={COLORS.muted}
          />
          {value && !isNaN(parseFloat(value)) && parseFloat(value) >= currentPrice / 100 && (
            <Text style={styles.warningText}>
              Target should be below current price ({formatPrice(currentPrice)})
            </Text>
          )}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={() => {
                const parsed = parseFloat(value);
                onSave(value.trim() ? Math.round(parsed * 100) : null);
              }}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function PriceAlertsScreen() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editAlert, setEditAlert] = useState<PriceAlert | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('nc_token');
      if (!token) { setAlerts([]); return; }
      const res = await fetch(`${API_URL}/price-alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchAlerts);

  const handleDelete = (alert: PriceAlert) => {
    Alert.alert(
      'Remove Alert',
      `Remove price alert for "${alert.product?.title ?? 'this product'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('nc_token');
              await fetch(`${API_URL}/price-alerts/product/${alert.productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token ?? ''}` },
              });
              setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
            } catch {
              Alert.alert('Error', 'Failed to remove alert.');
            }
          },
        },
      ],
    );
  };

  const handleSave = async (targetCents: number | null) => {
    if (!editAlert) return;
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('nc_token');
      const res = await fetch(`${API_URL}/price-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ productId: editAlert.productId, targetPriceCents: targetCents }),
      });
      if (res.ok) {
        await fetchAlerts();
        setEditAlert(null);
      }
    } catch {
      Alert.alert('Error', 'Failed to update alert.');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = alerts.filter((a) => a.isActive).length;
  const triggeredCount = alerts.filter((a) => {
    const current = a.product?.salePriceCents ?? a.product?.basePriceCents ?? 0;
    return a.targetPriceCents !== null && current <= a.targetPriceCents;
  }).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>📉 Price Tracking</Text>
              </View>
              <Text style={styles.heroTitle}>Price Alerts</Text>
              <Text style={styles.heroSub}>
                Get notified when prices drop on your saved products
              </Text>
            </View>

            {alerts.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{alerts.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: COLORS.green }]}>{activeCount}</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: COLORS.yellow }]}>{triggeredCount}</Text>
                  <Text style={styles.statLabel}>Target Met</Text>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📉</Text>
            <Text style={styles.emptyTitle}>No Price Alerts Yet</Text>
            <Text style={styles.emptyText}>
              Browse products and tap the bell icon to set price alerts.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onDelete={() => handleDelete(item)}
            onEdit={() => setEditAlert(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <EditModal
        visible={editAlert !== null}
        alert={editAlert}
        onClose={() => setEditAlert(null)}
        onSave={handleSave}
        saving={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 40 },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },

  hero: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#161b22',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '25',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.accent + '50',
  },
  heroBadgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: 13, color: COLORS.muted },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.border },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  cardInactive: { opacity: 0.6 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardLeft: { flex: 1, marginRight: 8 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  productTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  brandText: { fontSize: 11, color: COLORS.muted, marginTop: 2, textTransform: 'uppercase', fontWeight: '600' },
  triggeredBadge: {
    backgroundColor: COLORS.green + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.green + '50',
  },
  triggeredText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  inactiveBadge: {
    backgroundColor: COLORS.muted + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  inactiveText: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },

  priceRow: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  priceItem: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },
  priceLabel: { fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  priceValue: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  priceValueSmall: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  salePrice: { color: COLORS.green },
  targetPrice: { color: COLORS.blue },
  discountBadge: {
    fontSize: 10,
    color: COLORS.green,
    fontWeight: '700',
    backgroundColor: COLORS.green + '15',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 14,
  },
  createdText: { fontSize: 11, color: COLORS.muted },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.blue + '60',
    backgroundColor: COLORS.blue + '15',
  },
  editBtnText: { fontSize: 12, color: COLORS.blue, fontWeight: '600' },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent + '60',
    backgroundColor: COLORS.accent + '15',
  },
  deleteBtnText: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },

  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  modalProduct: { fontSize: 13, color: COLORS.muted, marginBottom: 12, lineHeight: 18 },
  modalCurrent: { fontSize: 13, color: COLORS.text, marginBottom: 16 },
  inputLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 8,
  },
  warningText: { fontSize: 12, color: COLORS.yellow, marginBottom: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.muted, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
