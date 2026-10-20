import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AddExpenseSheet from './src/components/AddExpense';
import AnimatedNumber from './src/components/AnimatedNumber';
import CurrencyChip from './src/components/CurrencyChip';
import CurrencyPicker from './src/components/CurrencyPicker';
import MonthPicker, {MonthStat} from './src/components/MonthPicker';
import ExpenseRow from './src/components/ExpenseRow';
import PressableScale from './src/components/PressableScale';
import SplashScreen from './src/components/SplashScreen';
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  currencyOf,
  getCurrency,
} from './src/constants/currencies';
import {storage} from './src/Storage';
import {
  Expense,
  formatDayTitle,
  formatMoney,
  localNowParts,
  monthKey,
  monthName,
  monthOnly,
  monthRange,
  toAmount,
} from './src/utils/format';

const STORAGE_KEY = 'UserExpense';
const CURRENCY_KEY = 'Currency';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const animateLayout = () =>
  LayoutAnimation.configureNext(
    LayoutAnimation.create(
      260,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity,
    ),
  );

const loadExpenses = (): Expense[] => {
  try {
    const parsed = JSON.parse(storage.getString(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const loadCurrency = (): CurrencyCode =>
  getCurrency(storage.getString(CURRENCY_KEY) ?? DEFAULT_CURRENCY).code;
const saveExpenses = (list: Expense[]) =>
  storage.set(STORAGE_KEY, JSON.stringify(list));

const sameExpense = (a: Expense, b: Expense) =>
  a.id && b.id
    ? a.id === b.id
    : a.datetime === b.datetime &&
      a.description === b.description &&
      toAmount(a.amount) === toAmount(b.amount);

type Section = {date: string; total: number; data: Expense[]};

function App(): React.JSX.Element {
  const [isAddExpense, setIsAddExpense] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [currency, setCurrencyState] = useState<CurrencyCode>(loadCurrency);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const currentMonth = monthKey();
  const [viewMonth, setViewMonth] = useState<string>(currentMonth);
  const [toast, setToast] = useState('');
  const [splashDone, setSplashDone] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const headerIn = useRef(new Animated.Value(0)).current;
  const fabIn = useRef(new Animated.Value(0)).current;
  const fabSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!splashDone) return;
    Animated.parallel([
      Animated.timing(headerIn, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(350),
        Animated.spring(fabIn, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [splashDone, headerIn, fabIn]);

  useEffect(() => {
    Animated.spring(fabSpin, {
      toValue: isAddExpense ? 1 : 0,
      friction: 6,
      tension: 110,
      useNativeDriver: true,
    }).start();
  }, [isAddExpense, fabSpin]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();


  const setCurrency = useCallback((code: CurrencyCode) => {
    storage.set(CURRENCY_KEY, code);
    animateLayout();
    setCurrencyState(code);
  }, []);

  const showToast = useCallback(
    (msg: string) => {
      setToast(msg);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      toastTimer.current = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 1800);
    },
    [toastOpacity],
  );

  // Per-month totals for the selected currency (newest month first).
  const monthStats = useMemo(() => {
    const map: Record<string, MonthStat> = {};
    const ensure = (k: string) =>
      (map[k] ||= {key: k, total: 0, count: 0, any: 0});
    expenses.forEach(e => {
      const k = (e.date || '').slice(0, 7);
      if (!k) return;
      const m = ensure(k);
      m.any++;
      if (currencyOf(e) === currency) {
        m.total += toAmount(e.amount);
        m.count++;
      }
    });
    ensure(currentMonth);
    ensure(viewMonth);
    return map;
  }, [expenses, currency, currentMonth, viewMonth]);

  const monthList = useMemo(
    () => Object.values(monthStats).sort((a, b) => (a.key < b.key ? 1 : -1)),
    [monthStats],
  );
  const viewIdx = monthList.findIndex(m => m.key === viewMonth);
  const olderKey = monthList[viewIdx + 1]?.key;
  const newerKey = viewIdx > 0 ? monthList[viewIdx - 1].key : undefined;
  const monthTotal = monthStats[viewMonth]?.total ?? 0;
  const viewingCurrent = viewMonth === currentMonth;

  const goToMonth = useCallback((key?: string) => {
    if (!key) return;
    animateLayout();
    setViewMonth(key);
  }, []);

  const sections = useMemo(() => {
    const byDate: Record<string, Expense[]> = {};
    expenses.forEach(e => {
      if (currencyOf(e) !== currency) return;
      if (!(e.date || '').startsWith(viewMonth)) return;
      (byDate[e.date] ||= []).push(e);
    });
    const secs: Section[] = Object.keys(byDate)
      .sort((a, b) => (a < b ? 1 : -1))
      .map(date => ({
        date,
        total: byDate[date].reduce((s, e) => s + toAmount(e.amount), 0),
        data: [...byDate[date]].sort((a, b) =>
          a.datetime < b.datetime ? 1 : -1,
        ),
      }));
    return secs;
  }, [expenses, viewMonth, currency]);

  const hasOtherCurrency = useMemo(
    () => expenses.some(e => currencyOf(e) !== currency),
    [expenses, currency],
  );

  const onAdd = (
    amount: number,
    description: string,
    category: string,
    expenseCurrency: CurrencyCode,
  ) => {
    const {datetime, date} = localNowParts();
    const item: Expense = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount,
      currency: expenseCurrency,
      description,
      category,
      datetime,
      date,
    };
    const next = [...loadExpenses(), item];
    saveExpenses(next);
    animateLayout();
    setExpenses(next);
    setViewMonth(monthKey());
    setIsAddExpense(false);
    if (expenseCurrency !== currency) {
      storage.set(CURRENCY_KEY, expenseCurrency);
      setCurrencyState(expenseCurrency);
      showToast(`Saved in ${expenseCurrency}`);
    } else {
      showToast('Expense saved');
    }
  };

  const confirmDelete = (item: Expense) => {
    const name =
      item.description.length > 24
        ? `${item.description.slice(0, 24)}...`
        : item.description;
    Alert.alert('Delete this expense?', `"${name}" will be removed.`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const current = loadExpenses();
          const idx = current.findIndex(e => sameExpense(e, item));
          if (idx >= 0) current.splice(idx, 1);
          saveExpenses(current);
          animateLayout();
          setExpenses(current);
          showToast('Expense deleted');
        },
      },
    ]);
  };

  const renderItem = ({item, index}: {item: Expense; index: number}) => (
    <ExpenseRow item={item} index={index} onDelete={confirmDelete} />
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#3585CC" />
      <Animated.View
        style={{
          zIndex: 20,
          opacity: headerIn,
          transform: [
            {
              translateY: headerIn.interpolate({
                inputRange: [0, 1],
                outputRange: [-40, 0],
              }),
            },
          ],
        }}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#3585CC', '#13A9B6', '#5FBED8']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.headerBg}
          />
          <SafeAreaView>
            <View
              style={[
                styles.headerInner,
                Platform.OS === 'android' && {
                  paddingTop: StatusBar.currentHeight,
                },
              ]}>
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>My Monthly Expense</Text>
                <CurrencyChip value={currency} onPress={() => setPickerOpen(true)} />
              </View>

              <View style={styles.monthRow}>
                <PressableScale
                  scaleTo={0.85}
                  hitSlop={8}
                  disabled={!olderKey}
                  onPress={() => goToMonth(olderKey)}
                  accessibilityLabel="Previous month"
                  style={[styles.arrow, !olderKey && styles.arrowOff]}>
                  <Icon name="chevron-back" size={20} color="#fff" />
                </PressableScale>
                <PressableScale
                  scaleTo={0.96}
                  hitSlop={6}
                  onPress={() => setMonthPickerOpen(true)}
                  accessibilityLabel="Choose month"
                  style={styles.monthBtn}>
                  <Text style={styles.monthLabel}>{monthName(viewMonth)}</Text>
                  <Icon name="chevron-down" size={15} color="#fff" />
                </PressableScale>
                <PressableScale
                  scaleTo={0.85}
                  hitSlop={8}
                  disabled={!newerKey}
                  onPress={() => goToMonth(newerKey)}
                  accessibilityLabel="Next month"
                  style={[styles.arrow, !newerKey && styles.arrowOff]}>
                  <Icon name="chevron-forward" size={20} color="#fff" />
                </PressableScale>
              </View>

              <View style={styles.totalBlock}>
                <Text style={styles.totalLabel}>
                  {viewingCurrent
                    ? 'You have spent'
                    : `Spent in ${monthOnly(viewMonth)}`}
                  {'  ·  '}
                  {monthRange(viewMonth)}
                </Text>
                <AnimatedNumber
                  value={monthTotal}
                  format={n => formatMoney(n, currency)}
                  style={styles.totalValue}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Animated.View>

      {splashDone && (
        <SectionList
          key={`${currency}-${viewMonth}`}
          sections={sections}
          keyExtractor={(item, i) => item.id ?? `${item.datetime}-${i}`}
          renderItem={renderItem}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({section}) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {formatDayTitle(section.date)}
              </Text>
              <Text style={styles.sectionTotal}>
                {formatMoney(section.total, currency)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Icon name="wallet-outline" size={40} color="#3585CC" />
              </View>
              <Text style={styles.emptyTitle}>
                {viewingCurrent
                  ? `No ${currency} expenses yet`
                  : `No ${currency} expenses in ${monthOnly(viewMonth)}`}
              </Text>
              <Text style={styles.emptyText}>
                {(monthStats[viewMonth]?.any ?? 0) > 0
                  ? `This month has expenses in ${
                      currency === 'PKR' ? 'SAR' : 'PKR'
                    }. Switch currency above to see them.`
                  : viewingCurrent
                  ? hasOtherCurrency
                    ? `You have expenses in ${
                        currency === 'PKR' ? 'SAR' : 'PKR'
                      }. Switch currency above, or tap + to add one here.`
                    : 'Tap the + button to add your first expense.'
                  : 'Nothing was recorded in this month.'}
              </Text>
            </View>
          }
        />
      )}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          {
            opacity: toastOpacity,
            transform: [
              {
                translateY: toastOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}>
        <Icon name="checkmark-circle" size={18} color="#fff" />
        <Text style={styles.toastText}>{toast}</Text>
      </Animated.View>

      <Animated.View
        pointerEvents={splashDone ? 'auto' : 'none'}
        style={[
          styles.fabWrap,
          {
            opacity: fabIn,
            transform: [
              {scale: fabIn},
              {
                rotate: fabSpin.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '135deg'],
                }),
              },
            ],
          },
        ]}>
        <PressableScale
          onPress={() => setIsAddExpense(true)}
          scaleTo={0.88}
          accessibilityLabel="Add expense"
          style={styles.fab}>
          <Icon name="add" size={34} color="#fff" />
        </PressableScale>
      </Animated.View>

      <CurrencyPicker
        visible={pickerOpen}
        value={currency}
        onClose={() => setPickerOpen(false)}
        onSelect={code => {
          setPickerOpen(false);
          if (code !== currency) setCurrency(code);
        }}
      />

      <MonthPicker
        visible={monthPickerOpen}
        months={monthList}
        selected={viewMonth}
        current={currentMonth}
        currency={currency}
        onClose={() => setMonthPickerOpen(false)}
        onSelect={key => {
          setMonthPickerOpen(false);
          goToMonth(key);
        }}
      />

      <AddExpenseSheet
        isVisible={isAddExpense}
        currency={currency}
        onClose={() => setIsAddExpense(false)}
        handleSave={onAdd}
      />
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F1F5F9'},
  header: {
    backgroundColor: '#3585CC',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#13A9B6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerInner: {paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24},
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthRow: {flexDirection: 'row', alignItems: 'center', marginTop: 14},
  arrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowOff: {opacity: 0.3},
  monthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 38,
  },
  monthLabel: {color: '#fff', fontSize: 18, fontWeight: '800'},
  rangeText: {
    flex: 1,
    textAlign: 'right',
    color: '#FFFFFFCC',
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitles: {flex: 1, paddingRight: 12},
  headerTitle: {color: '#FFFFFFE0', fontSize: 18, fontWeight: '700'},
  headerRange: {color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2},
  totalBlock: {marginTop: 16},
  totalLabel: {color: '#FFFFFFCC', fontSize: 13, fontWeight: '500'},
  totalValue: {color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 2},
  listContent: {paddingHorizontal: 16, paddingBottom: 120, flexGrow: 1},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 22,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {fontSize: 15, fontWeight: '800', color: '#0F172A'},
  sectionTotal: {fontSize: 13, fontWeight: '700', color: '#64748B'},
  empty: {alignItems: 'center', marginTop: 70, paddingHorizontal: 40},
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E0F0FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  fabWrap: {
    position: 'absolute',
    right: 22,
    bottom: Platform.OS === 'ios' ? 36 : 24,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3585CC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3585CC',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: Platform.OS === 'ios' ? 46 : 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172AEE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    zIndex: 60,
    elevation: 60,
  },
  toastText: {color: '#fff', fontSize: 14, fontWeight: '600'},
});

export default App;
