import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState<any>();
  const [updateIntervalMilliseconds, setUpdateInterval] = useState<number>(1000);

  const _slow = () => {
    setUpdateInterval(1000)
  };

  const _fast = () => {
    setUpdateInterval(100)
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(updateIntervalMilliseconds);
  }, [updateIntervalMilliseconds]);

  let measuredData: Array<number[]> = [];
  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
        const acc = Object.values(accelerometerData);
        measuredData.push(acc);
        if (measuredData.length > 10) {
          measuredData = measuredData.slice(1);
        }

        // Velocidades
        const vx = integrate(measuredData.map(e => e[0]), updateIntervalMilliseconds / 1000);
        const vy = integrate(measuredData.map(e => e[1]), updateIntervalMilliseconds / 1000);
        const vz = integrate(measuredData.map(e => e[2]), updateIntervalMilliseconds / 1000);

        // console.log(measuredData)
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const { x, y, z } = data;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accelerometer: (in Gs where 1 G = 9.81 m s^-2)</Text>
      <Text style={styles.text}>
        x: {round(x)} y: {round(y)} z: {round(z)}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function round(n: number | null | undefined) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
}

function integrate(array: number[], interval: number) {
  const delta = array.map((v, i, a) => v - (a[i - 1] || 0))
  return delta.map(value => value / interval).slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  text: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});
