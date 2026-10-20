import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {CATEGORIES} from '../constants/categories';
import {CURRENCIES, CurrencyCode, getCurrency} from '../constants/currencies';
import {formatAmountInput, sanitizeAmount} from '../utils/format';
import PressableScale from './PressableScale';

type Props = {
  isVisible: boolean;
  currency: CurrencyCode;
  onClose: () => void;
  handleSave: (
    amount: number,
    description: string,
    category: string,
    currency: CurrencyCode,
  ) => void;
};

const SCREEN_H = Dimensions.get('window').height;

// A bottom sheet drawn in the normal view tree. It deliberately avoids RN's
// native <Modal>, which can get stuck half-dismissed on iOS (leaving a ghost
// sheet that swallows every tap).
const AddExpenseSheet = ({isVisible, currency, onClose, handleSave}: Props) => {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [sheetCurrency, setSheetCurrency] = useState<CurrencyCode>(currency);

  const backdrop = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(SCREEN_H)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const blocks = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const parsed = parseFloat(amount);
  const canSave =
    Number.isFinite(parsed) &&
    parsed > 0 &&
    description.trim() !== '' &&
    !!selectedCat;

  const reset = useCallback(() => {
    setAmount('');
    setDescription('');
    setSelectedCat('');
  }, []);

  useEffect(() => {
    if (isVisible) {
      setSheetCurrency(currency);
      setMounted(true);
      drag.setValue(0);
      blocks.forEach(b => b.setValue(0));
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(slide, {
          toValue: 0,
          damping: 21,
          stiffness: 190,
          mass: 0.9,
          useNativeDriver: true,
        }),
        Animated.stagger(
          55,
          blocks.map(b =>
            Animated.timing(b, {
              toValue: 1,
              duration: 340,
              delay: 110,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
        ),
      ]).start();
    } else if (mounted) {
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 240,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: SCREEN_H,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(drag, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) {
          setMounted(false);
          reset();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
        onPanResponderRelease: (_, g) => {
          if (g.dy > 110 || g.vy > 0.9) {
            Keyboard.dismiss();
            onCloseRef.current();
          } else {
            Animated.spring(drag, {
              toValue: 0,
              damping: 18,
              stiffness: 220,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [drag],
  );

  const save = () => {
    if (!canSave) return;
    Keyboard.dismiss();
    handleSave(parsed, description.trim(), selectedCat, sheetCurrency);
  };

  // Keep the raw value comma-free; the field shows it with thousands commas.
  const onAmountChange = (t: string) =>
    setAmount(sanitizeAmount(t.replace(/,/g, '')));

  const rise = (b: Animated.Value) => ({
    opacity: b,
    transform: [
      {translateY: b.interpolate({inputRange: [0, 1], outputRange: [18, 0]})},
    ],
  });

  if (!mounted) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View
        style={[styles.backdrop, {opacity: backdrop}]}
        pointerEvents={isVisible ? 'auto' : 'none'}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close"
        />
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.kav}
        pointerEvents="box-none"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View
          style={[
            styles.sheet,
            {transform: [{translateY: Animated.add(slide, drag)}]},
          ]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
            <View style={styles.titleRow}>
              <Text style={styles.title}>Add Expense</Text>
              <PressableScale
                scaleTo={0.85}
                hitSlop={12}
                onPress={onClose}
                accessibilityLabel="Close sheet"
                style={styles.closeButton}>
                <Icon name="close" color="#334155" size={20} />
              </PressableScale>
            </View>
          </View>

          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <Animated.View
              style={[styles.block, styles.blockTop, rise(blocks[0])]}>
              <Text style={styles.label}>Currency</Text>
              <View style={styles.pills}>
                {CURRENCIES.map(c => {
                  const active = c.code === sheetCurrency;
                  return (
                    <View key={c.code} style={styles.pillWrap}>
                      <PressableScale
                        scaleTo={0.95}
                        onPress={() => setSheetCurrency(c.code)}
                        accessibilityRole="button"
                        accessibilityState={{selected: active}}
                        style={[styles.pill, active && styles.pillActive]}>
                        <Text style={styles.pillFlag}>{c.flag}</Text>
                        <Text
                          style={[
                            styles.pillText,
                            active && styles.pillTextActive,
                          ]}>
                          {c.code}
                        </Text>
                      </PressableScale>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountRow}>
                <Text style={styles.amountCode}>
                  {getCurrency(sheetCurrency).code}
                </Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  value={formatAmountInput(amount)}
                  keyboardType="decimal-pad"
                  maxLength={16}
                  onChangeText={onAmountChange}
                />
              </View>
            </Animated.View>

            <Animated.View style={[styles.block, rise(blocks[1])]}>
              <Text style={styles.label}>Where did you spend?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Lunch at Cafe"
                placeholderTextColor="#94A3B8"
                value={description}
                maxLength={60}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                onChangeText={setDescription}
              />
            </Animated.View>

            <Animated.View style={[styles.block, rise(blocks[2])]}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categories}>
                {CATEGORIES.map(cat => {
                  const active = cat.key === selectedCat;
                  return (
                    <PressableScale
                      key={cat.key}
                      scaleTo={0.9}
                      onPress={() => setSelectedCat(cat.key)}
                      style={[
                        styles.chip,
                        active && {
                          backgroundColor: cat.color,
                          borderColor: cat.color,
                        },
                      ]}>
                      <View
                        style={[
                          styles.chipIcon,
                          {backgroundColor: active ? '#FFFFFF33' : cat.color},
                        ]}>
                        {cat.renderIcon(14)}
                      </View>
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}>
                        {cat.title}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </Animated.View>
          </ScrollView>

          <Animated.View style={[styles.block, rise(blocks[3])]}>
            <PressableScale onPress={save} disabled={!canSave} scaleTo={0.96}>
              <View
                style={[styles.saveButton, !canSave && styles.saveDisabled]}>
                <Icon name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveText}>Save Expense</Text>
              </View>
            </PressableScale>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {...StyleSheet.absoluteFillObject, zIndex: 50, elevation: 50},
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: '#0F172A99'},
  kav: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 54,
  },
  sheet: {
    // Never taller than the space left above the keyboard; the form scrolls.
    maxHeight: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: -6},
    elevation: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {fontSize: 20, fontWeight: '800', color: '#0F172A'},
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: {zIndex: 1},
  blockTop: {zIndex: 5},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 14,
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    minHeight: 56,
  },
  amountCode: {fontSize: 16, fontWeight: '800', color: '#3585CC'},
  pills: {flexDirection: 'row', gap: 10},
  pillWrap: {flex: 1},
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  pillActive: {borderColor: '#3585CC', backgroundColor: '#EAF3FC'},
  pillFlag: {fontSize: 20},
  pillText: {fontSize: 15, fontWeight: '700', color: '#475569'},
  pillTextActive: {color: '#1E5E99', fontWeight: '900'},
  amountInput: {
    flex: 1,
    height: 54,
    marginLeft: 12,
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  input: {
    height: 50,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  form: {flexGrow: 0, flexShrink: 1},
  formContent: {paddingBottom: 4},
  categories: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  chipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  chipText: {fontSize: 13, fontWeight: '600', color: '#334155'},
  chipTextActive: {color: '#fff'},
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#3585CC',
  },
  saveDisabled: {backgroundColor: '#B6D0E8'},
  saveText: {color: '#fff', fontSize: 16, fontWeight: '800'},
});

export default AddExpenseSheet;
