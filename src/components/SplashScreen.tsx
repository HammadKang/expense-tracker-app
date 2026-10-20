import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = { onDone: () => void };

const LOGO = 140; // must match the native LaunchScreen image size

// Frame 0 is identical to the native launch screen (flat blue + wallet), so the
// hand-off is invisible. Then: gradient blooms in, a coin drops into the
// wallet, the wallet squashes, a ripple fires, and the title rises in.
const SplashScreen = ({ onDone }: Props) => {
  const gradient = useRef(new Animated.Value(0)).current;
  const stageScale = useRef(new Animated.Value(1)).current;
  const stageLift = useRef(new Animated.Value(0)).current;
  const coinY = useRef(new Animated.Value(-340)).current;
  const coinOpacity = useRef(new Animated.Value(0)).current;
  const coinTilt = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = (v: Animated.Value, to: number, duration: number, easing = Easing.out(Easing.cubic), delay = 0) =>
      Animated.timing(v, { toValue: to, duration, easing, delay, useNativeDriver: true });

    const anim = Animated.sequence([
      // 1. bloom + grow, coin falls in
      Animated.parallel([
        t(gradient, 1, 520),
        t(stageScale, 1.25, 700, Easing.out(Easing.cubic)),
        t(stageLift, -46, 700, Easing.out(Easing.cubic)),
        t(coinOpacity, 1, 1, Easing.linear, 260),
        Animated.sequence([
          Animated.delay(260),
          t(coinY, 0, 430, Easing.in(Easing.quad)),
        ]),
        Animated.sequence([Animated.delay(260), t(coinTilt, 1, 430, Easing.in(Easing.quad))]),
      ]),
      // 2. impact: wallet squash + ripple, coin settles
      Animated.parallel([
        Animated.sequence([
          t(squash, 0.9, 110, Easing.out(Easing.quad)),
          Animated.spring(squash, { toValue: 1, friction: 3.4, tension: 170, useNativeDriver: true }),
        ]),
        t(ring, 1, 760, Easing.out(Easing.cubic)),
        Animated.sequence([Animated.delay(120), t(title, 1, 420)]),
        Animated.sequence([Animated.delay(260), t(tagline, 1, 420)]),
        Animated.sequence([Animated.delay(380), t(bar, 1, 420)]),
      ]),
      Animated.delay(520),
      // 3. exit
      Animated.parallel([
        t(exit, 0, 360, Easing.in(Easing.quad)),
        t(exitScale, 1.06, 360, Easing.in(Easing.quad)),
      ]),
    ]);
    anim.start(({ finished }) => finished && onDone());
    return () => anim.stop();
  }, [bar, coinOpacity, coinTilt, coinY, exit, exitScale, gradient, onDone, ring, squash, stageLift, stageScale, tagline, title]);

  const rise = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.root, { opacity: exit, transform: [{ scale: exitScale }] }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: gradient }]}>
        <LinearGradient
          colors={['#3585CC', '#13A9B6', '#5FBED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.stage,
            { transform: [{ translateY: stageLift }, { scale: stageScale }] },
          ]}>
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ring.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] }),
                transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.7, 2.3] }) }],
              },
            ]}
          />
          <Animated.Image
            source={require('../assets/splash-coin.png')}
            style={[
              styles.layer,
              {
                opacity: coinOpacity,
                transform: [
                  { translateY: coinY },
                  { rotate: coinTilt.interpolate({ inputRange: [0, 1], outputRange: ['-35deg', '0deg'] }) },
                ],
              },
            ]}
          />
          <Animated.Image
            source={require('../assets/splash-wallet.png')}
            style={[styles.layer, { transform: [{ scale: squash }] }]}
          />
        </Animated.View>

        <Animated.Text style={[styles.title, rise(title)]}>Expense Tracker</Animated.Text>
        <Animated.Text style={[styles.tagline, rise(tagline)]}>
          Track every rupee & riyal, effortlessly
        </Animated.Text>
        <Animated.View
          style={[
            styles.barTrack,
            { opacity: bar },
          ]}>
          <Animated.View
            style={[
              styles.barFill,
              { transform: [{ scaleX: bar }] },
            ]}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: '#3585CC', zIndex: 100, elevation: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stage: { width: LOGO, height: LOGO, alignItems: 'center', justifyContent: 'center' },
  layer: { position: 'absolute', width: LOGO, height: LOGO },
  ring: {
    position: 'absolute',
    width: LOGO * 0.7,
    height: LOGO * 0.7,
    borderRadius: LOGO,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  title: { marginTop: 54, color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 0.4 },
  tagline: { marginTop: 8, color: '#FFFFFFD0', fontSize: 14, fontWeight: '500' },
  barTrack: {
    marginTop: 28,
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF33',
    overflow: 'hidden',
  },
  barFill: { flex: 1, backgroundColor: '#FFFFFF' },
});

export default SplashScreen;
