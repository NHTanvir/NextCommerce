import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

interface TrackingInfo {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  currentStatus: string;
  events: TrackingEvent[];
}

const MOCK_TRACKING: TrackingInfo = {
  orderId: 'ord-demo',
  carrier: 'UPS',
  trackingNumber: '1Z999AA10123456784',
  estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }),
  currentStatus: 'In Transit',
  events: [
    {
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'In Transit',
      location: 'Newark, NJ',
      description: 'Package arrived at UPS facility',
    },
    {
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'Out for Delivery',
      location: 'Brooklyn, NY',
      description: 'Package is out for delivery',
    },
    {
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'Shipped',
      location: 'Los Angeles, CA',
      description: 'Package picked up by carrier',
    },
    {
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: 'Label Created',
      location: 'NextCommerce Warehouse',
      description: 'Shipping label created',
    },
  ],
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function OrderTrackingScreen({ route, navigation }: Props) {
  const { orderId } = route.params ?? { orderId: 'demo' };
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTracking = useCallback(async () => {
    // In production, fetch from API: GET /orders/:orderId/tracking
    await new Promise((r) => setTimeout(r, 600));
    setTracking(MOCK_TRACKING);
    setLoading(false);
    setRefreshing(false);
  }, [orderId]);

  useEffect(() => {
    loadTracking();
  }, [loadTracking]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTracking();
  };

  const openCarrierSite = () => {
    if (!tracking) return;
    const urls: Record<string, string> = {
      UPS: `https://www.ups.com/track?tracknum=${tracking.trackingNumber}`,
      FedEx: `https://www.fedex.com/apps/fedextrack/?tracknumbers=${tracking.trackingNumber}`,
      USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking.trackingNumber}`,
      DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${tracking.trackingNumber}`,
    };
    const url = urls[tracking.carrier];
    if (url) Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Loading tracking info…</Text>
      </View>
    );
  }

  if (!tracking) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>No tracking info</Text>
        <Text style={styles.errorSub}>Tracking will appear once your order ships.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
      }
    >
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.carrier}>{tracking.carrier}</Text>
        <Text style={styles.trackingNum}>{tracking.trackingNumber}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{tracking.currentStatus}</Text>
        </View>
        <Text style={styles.eta}>Estimated delivery: {tracking.estimatedDelivery}</Text>
        <TouchableOpacity style={styles.trackBtn} onPress={openCarrierSite}>
          <Text style={styles.trackBtnText}>Track on {tracking.carrier} →</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>Tracking History</Text>
        {tracking.events.map((event, idx) => (
          <View key={idx} style={styles.eventRow}>
            <View style={styles.dotCol}>
              <View style={[styles.dot, idx === 0 && styles.dotActive]} />
              {idx < tracking.events.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventStatus}>{event.status}</Text>
              <Text style={styles.eventDesc}>{event.description}</Text>
              <View style={styles.eventMeta}>
                <Text style={styles.eventLoc}>{event.location}</Text>
                <Text style={styles.eventTime}>{formatTimestamp(event.timestamp)}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>← Back to Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const ACCENT = '#e94560';
const BG = '#0d1117';
const SURFACE = '#1c2128';
const BORDER = '#30363d';
const TEXT = '#e6edf3';
const MUTED = '#8b949e';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: MUTED,
    fontSize: 14,
    marginTop: 8,
  },
  errorTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '700',
  },
  errorSub: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 8,
    marginBottom: 8,
  },
  carrier: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  trackingNum: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT,
    fontFamily: 'monospace',
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: `${ACCENT}20`,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: ACCENT,
  },
  statusPillText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: '700',
  },
  eta: {
    color: MUTED,
    fontSize: 13,
  },
  trackBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  trackBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  timeline: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 0,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
  },
  eventRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 70,
  },
  dotCol: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BORDER,
    borderWidth: 2,
    borderColor: MUTED,
    marginTop: 2,
  },
  dotActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: BORDER,
    marginTop: 4,
    marginBottom: 0,
  },
  eventInfo: {
    flex: 1,
    paddingBottom: 16,
    gap: 3,
  },
  eventStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
  },
  eventDesc: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  eventLoc: {
    fontSize: 11,
    color: MUTED,
  },
  eventTime: {
    fontSize: 11,
    color: MUTED,
  },
  backBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backBtnText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },
});
