import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, Text, TextStyle } from 'react-native';

type Props = {
  value: number;
  format: (n: number) => string;
  style?: StyleProp<TextStyle>;
};

// Counts from the previously shown value to the new one.
const AnimatedNumber = ({ value, format, style }: Props) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setShown(v));
    return () => anim.removeListener(id);
  }, [anim]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, value]);

  return (
    <Text style={style} adjustsFontSizeToFit numberOfLines={1}>
      {format(shown)}
    </Text>
  );
};

export default AnimatedNumber;
