import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { differenceInDays, parseISO } from 'date-fns';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { COLORS } from '../constants';

interface Props {
  deadline: string;
  createdAt: string;
}

export function DeadlineBar({ deadline, createdAt }: Props) {
  const total = differenceInDays(parseISO(deadline), parseISO(createdAt));
  const remaining = differenceInDays(parseISO(deadline), new Date());
  const pct = Math.max(0, Math.min(1, remaining / Math.max(1, total)));

  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withTiming(pct, { duration: 800 }); }, [pct]);

  const animated = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` as any }));

  const color = pct > 0.5 ? COLORS.success : pct > 0.25 ? COLORS.warning : COLORS.danger;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, animated]} />
      </View>
      <Text style={[styles.label, { color }]}>
        {remaining <= 0 ? 'ExpirÃ©' : `${remaining}j restants`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  label: { fontSize: 12, fontWeight: '600', minWidth: 80, textAlign: 'right' },
});