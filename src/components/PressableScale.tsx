import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type Props = PressableProps & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  children?: React.ReactNode;
};

const PressableScale = ({ style, scaleTo = 0.94, children, onPressIn, onPressOut, ...rest }: Props) => {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number, bounce: boolean) =>
    Animated.spring(scale, {
      toValue: v,
      friction: bounce ? 4 : 8,
      tension: bounce ? 180 : 300,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      {...rest}
      onPressIn={e => {
        to(scaleTo, false);
        onPressIn?.(e);
      }}
      onPressOut={e => {
        to(1, true);
        onPressOut?.(e);
      }}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
};

export default PressableScale;
