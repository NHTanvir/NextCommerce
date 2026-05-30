import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({ rating, maxRating = 5, size = 20, interactive = false, onRate }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const star = filled ? '★' : '☆';
        const color = filled ? '#f0c040' : '#30363d';

        if (interactive && onRate) {
          return (
            <TouchableOpacity key={i} onPress={() => onRate(i + 1)}>
              <Text style={[styles.star, { fontSize: size, color }]}>{star}</Text>
            </TouchableOpacity>
          );
        }
        return <Text key={i} style={[styles.star, { fontSize: size, color }]}>{star}</Text>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { lineHeight: 1.2 },
});
