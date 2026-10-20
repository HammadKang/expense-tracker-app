import React from 'react';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

export type Category = {
  key: string;
  title: string;
  color: string;
  renderIcon: (size?: number, color?: string) => React.JSX.Element;
};

const ion =
  (name: string) =>
  (size = 20, color = '#fff') =>
    <IonIcon name={name} size={size} color={color} />;
const mci =
  (name: string) =>
  (size = 20, color = '#fff') =>
    <MCI name={name} size={size} color={color} />;

export const CATEGORIES: Category[] = [
  { key: 'Food', title: 'Food', color: '#F5A623', renderIcon: ion('fast-food-outline') },
  { key: 'Drink', title: 'Drink', color: '#B3304A', renderIcon: ion('wine-outline') },
  { key: 'Gift', title: 'Gift', color: '#EC4A93', renderIcon: ion('gift-outline') },
  { key: 'Petrol', title: 'Petrol', color: '#E76937', renderIcon: mci('gas-station-outline') },
  { key: 'Snacks', title: 'Snacks', color: '#E8B30C', renderIcon: mci('french-fries') },
  { key: 'Shopping', title: 'Shopping', color: '#14B8A6', renderIcon: mci('cart-outline') },
  { key: 'Mechanic', title: 'Mechanic', color: '#475569', renderIcon: mci('car-wrench') },
  { key: 'Mobile', title: 'Mobile', color: '#6D4AE0', renderIcon: ion('phone-portrait-outline') },
  { key: 'Bills', title: 'Bills', color: '#00853A', renderIcon: ion('receipt-outline') },
  { key: 'Car', title: 'Car', color: '#1666C7', renderIcon: mci('car-side') },
  { key: 'Others', title: 'Others', color: '#F95C5C', renderIcon: ion('ellipsis-horizontal') },
];

const FALLBACK = CATEGORIES[CATEGORIES.length - 1];

export const getCategory = (key: string): Category =>
  CATEGORIES.find(c => c.key === key) ?? FALLBACK;
