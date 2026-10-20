import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PressableScale from './PressableScale';
import { CurrencyCode, getCurrency } from '../constants/currencies';

type Props = { value: CurrencyCode; onPress: () => void };

// Big, obvious button (>= 44pt tall) that opens the currency picker.
const CurrencyChip = ({ value, onPress }: Props) => {
  const c = getCurrency(value);
  return (
    <PressableScale
      scaleTo={0.93}
      hitSlop={12}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Currency ${c.code}. Tap to change`}
      style={styles.chip}>
      <Text style={styles.flag}>{c.flag}</Text>
      <Text style={styles.code}>{c.code}</Text>
      <Icon name="chevron-down" size={16} color="#fff" />
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#FFFFFF38',
    borderWidth: 1.5,
    borderColor: '#FFFFFF66',
  },
  flag: { fontSize: 20 },
  code: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});

export default CurrencyChip;
