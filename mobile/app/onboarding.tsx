import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  interpolateColor, useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { usePrefsStore } from '../src/store';
import { COLORS } from '../src/constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'library',
    color: '#3B82F6',
    gradient: ['#1E3A8A', '#3B82F6'] as [string, string],
    title: 'Tous les appels en un endroit',
    subtitle: 'Communications, publications, bourses, colloques…\nCentralisés pour vous en temps réel.',
  },
  {
    id: '2',
    icon: 'notifications',
    color: '#8B5CF6',
    gradient: ['#4C1D95', '#8B5CF6'] as [string, string],
    title: 'Alertes personnalisées',
    subtitle: 'Recevez des notifications intelligentes basées sur vos domaines de recherche.',
  },
  {
    id: '3',
    icon: 'calendar',
    color: '#10B981',
    gradient: ['#064E3B', '#10B981'] as [string, string],
    title: 'Ne manquez plus aucune deadline',
    subtitle: 'Ajoutez les échéances Ã  votre calendrier en un seul tap.',
  },
  {
    id: '4',
    icon: 'megaphone',
    color: '#F59E0B',
    gradient: ['#78350F', '#F59E0B'] as [string, string],
    title: 'Partagez et publiez',
    subtitle: 'Diffusez vos appels auprès de 60 000+ chercheurs africains de l\'espace CAMES.',
  },
];

export default function OnboardingScreen() {
  const { setOnboardingDone } = usePrefsStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const finish = () => {
    setOnboardingDone();
    router.replace('/(auth)/login');
  };

  const next = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      finish();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatRef as any}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={(e) =>
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={styles.slide}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon as any} size={80} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
        keyExtractor={(i) => i.id}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, activeIndex === i && styles.dotActive]}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={finish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={next} style={styles.nextBtn}>
          <Text style={styles.nextText}>
            {activeIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconWrap: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  actions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 48,
  },
  skipBtn: { padding: 12 },
  skipText: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 30,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});