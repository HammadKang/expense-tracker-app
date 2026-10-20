import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet from './BottomSheet';
import { CURRENCIES, CurrencyCode } from '../constants/currencies';

type Props = {
  visible: boolean;
  value: CurrencyCode;
  onSelect: (code: CurrencyCode) => void;
  onClose: () => void;
};

const CurrencyPicker = ({ visible, value, onSelect, onClose }: Props) => (
  <BottomSheet
    visible={visible}
    onClose={onClose}
    title="Choose currency"
    subtitle="Your total and list show expenses in the selected currency.">
    {CURRENCIES.map(c => {
      const active = c.code === value;
      return (
        <Pressable
          key={c.code}
          onPress={() => onSelect(c.code)}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.rowPressed]}>
          <Text style={styles.flag}>{c.flag}</Text>
          <View style={styles.rowText}>
            <Text style={styles.code}>{c.code}</Text>
            <Text style={styles.name}>{c.name}</Text>
          </View>
          {active ? (
            <Icon name="checkmark-circle" size={26} color="#3585CC" />
          ) : (
            <View style={styles.radio} />
          )}
        </Pressable>
      );
    })}
  </BottomSheet>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  rowActive: { borderColor: '#3585CC', backgroundColor: '#EEF5FC' },
  rowPressed: { opacity: 0.7 },
  flag: { fontSize: 30, marginRight: 14 },
  rowText: { flex: 1 },
  code: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  name: { fontSize: 13, color: '#64748B', marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1' },
});

export default CurrencyPicker;
