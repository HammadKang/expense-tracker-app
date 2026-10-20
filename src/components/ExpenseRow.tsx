import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PressableScale from './PressableScale';
import { getCategory } from '../constants/categories';
import { currencyOf } from '../constants/currencies';
import { Expense, formatMoney, formatTime, toAmount } from '../utils/format';

type Props = {
  item: Expense;
  index: number;
  onDelete: (item: Expense) => void;
};

const ExpenseRow = ({ item, index, onDelete }: Props) => {
  const enter = useRef(new Animated.Value(0)).current;
  const cat = getCategory(item.category);

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index, 8) * 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) },
          { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
        ],
      }}>
      <PressableScale
        scaleTo={0.975}
        onLongPress={() => onDelete(item)}
        style={styles.row}>
        <View style={[styles.catIcon, { backgroundColor: cat.color }]}>{cat.renderIcon(20)}</View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.sub}>
            {cat.title} · {formatTime(item.datetime)}
          </Text>
        </View>
        <Text style={styles.amount}>{formatMoney(toAmount(item.amount), currencyOf(item))}</Text>
        <PressableScale
          scaleTo={0.8}
          hitSlop={10}
          onPress={() => onDelete(item)}
          accessibilityLabel="Delete expense"
          style={styles.trash}>
          <Icon name="trash-outline" size={18} color="#94A3B8" />
        </PressableScale>
      </PressableScale>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  catIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginHorizontal: 12 },
  title: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  trash: { marginLeft: 10, padding: 2 },
});

export default ExpenseRow;
