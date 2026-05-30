import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export function LoadingOverlay() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#e94560" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 17, 23, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
