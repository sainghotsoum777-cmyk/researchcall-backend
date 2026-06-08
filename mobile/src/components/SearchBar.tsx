import React, { useRef, useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  colorScheme?: 'light' | 'dark';
}

export function SearchBar({
  value, onChangeText, onSubmit, onFocus, onBlur,
  placeholder = 'Rechercher...', autoFocus, colorScheme = 'light',
}: Props) {
  const isDark = colorScheme === 'dark';
  const scale = useRef(new Animated.Value(1)).current;

  const onFocusAnim = () => {
    Animated.spring(scale, { toValue: 1.02, useNativeDriver: true }).start();
    onFocus?.();
  };
  const onBlurAnim = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    onBlur?.();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? COLORS.surface.dark : '#F1F5F9',
          borderColor: isDark ? COLORS.border.dark : 'transparent',
        },
      ]}>
        <Ionicons name="search" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
        <TextInput
          style={[styles.input, { color: isDark ? '#F1F5F9' : '#0F172A' }]}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={onFocusAnim}
          onBlur={onBlurAnim}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={isDark ? '#475569' : '#94A3B8'} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingVertical: 8 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15 },
});