import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet from './BottomSheet';
import { formatMoney, monthName } from '../utils/format';

export type MonthStat = { key: string; total: number; count: number; any: number };

type Props = {
  visible: boolean;
  months: MonthStat[]; // newest first
  selected: string;
  current: string;
  currency: string;
  onSelect: (key: string) => void;
  onClose: () => void;
};

const MonthPicker = ({ visible, months, selected, current, currency, onSelect, onClose }: Props) => (
  <BottomSheet
    visible={visible}
    onClose={onClose}
    title="Choose month"
    subtitle={`Totals shown in ${currency}. Pick a month to see its expenses.`}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
      {months.map(m => {
        const active = m.key === selected;
        const sub =
          m.count > 0
            ? `${m.count} expense${m.count === 1 ? '' : 's'}`
            : m.any > 0
            ? `No ${currency} expenses`
            : 'No expenses';
        return (
          <Pressable
            key={m.key}
            onPress={() => onSelect(m.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.rowPressed]}>
            <View style={[styles.badge, m.key === current && styles.badgeCurrent]}>
              <Icon
                name="calendar-outline"
                size={22}
                color={m.key === current ? '#fff' : '#3585CC'}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.month}>
                {monthName(m.key)}
                {m.key === current ? '  ·  This month' : ''}
              </Text>
              <Text style={styles.sub}>{sub}</Text>
            </View>
            <Text style={[styles.total, m.count === 0 && styles.totalMuted]}>
              {m.count > 0 ? formatMoney(m.total, currency) : '—'}
            </Text>
            {active && <Icon name="checkmark-circle" size={22} color="#3585CC" style={styles.tick} />}
          </Pressable>
        );
      })}
    </ScrollView>
  </BottomSheet>
);

const styles = StyleSheet.create({
  list: { paddingBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  rowActive: { borderColor: '#3585CC', backgroundColor: '#EEF5FC' },
  rowPressed: { opacity: 0.7 },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E0EEFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeCurrent: { backgroundColor: '#3585CC' },
  rowText: { flex: 1 },
  month: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  total: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginLeft: 8 },
  totalMuted: { color: '#94A3B8' },
  tick: { marginLeft: 8 },
});

export default MonthPicker;
