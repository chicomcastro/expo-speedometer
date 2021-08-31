import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [acceleration, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [velocity, setVelocity] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState<any>();
  const [updateIntervalMilliseconds, setUpdateInterval] = useState<number>(100);
  const [speed, setSpeed] = useState<number>(0);

  const _slow = () => {
    setUpdateInterval(200)
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
        const G = 9.81; // m/s^2

        // Object data from accelerometer (G)
        // console.log(accelerometerData);
        const { x, y, z } = accelerometerData;

        // Extract values and convert to m/s^2
        const acc = [x, y, z].map(component => component * G);

        // Append to array of values
        measuredData.push(acc);
        if (measuredData.length >= 10) {
          measuredData = measuredData.slice(1);
        }
        const axArray = (measuredData.map(e => e[0]));
        const ayArray = (measuredData.map(e => e[1]));
        const azArray = (measuredData.map(e => e[2]));

        const axMean = arrayMean(axArray);
        const ayMean = arrayMean(ayArray);
        const azMean = arrayMean(azArray);

        setData({
          x: axMean,
          y: ayMean,
          z: azMean,
        });

        // Velocidades
        const vxArray = integrate(axArray, updateIntervalMilliseconds / 1000);
        const vyArray = integrate(ayArray, updateIntervalMilliseconds / 1000);
        const vzArray = integrate(azArray, updateIntervalMilliseconds / 1000);

        const vxMean = arrayMean(vxArray);
        const vyMean = arrayMean(vyArray);
        const vzMean = arrayMean(vzArray);

        const vx = vxMean;
        const vy = vyMean;
        const vz = vzMean;

        const normV = norm([vx, vy, vz]);
        setSpeed(normV);
        setVelocity({
          x: vx,
          y: vy,
          z: vz,
        });
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

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accelerometer: (in Gs where 1 G = 9.81 m s^-2)</Text>
      <Text style={styles.text}>
        ax: {round(acceleration.x)} ay: {round(acceleration.y)} az: {round(acceleration.z)}
      </Text>
      <Text style={styles.text}>
        vx: {round(velocity.x)} vy: {round(velocity.y)} vz: {round(velocity.z)}
      </Text>
      <Text style={styles.text}>
        Speed: {round(speed)} m/s - {round(speed / 3.6)} km/h
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
  return Math.round(n * 100) / 100;
}

function integrate(array: number[], interval: number) {
  const delta = array.map((v, i, a) => v - (a[i - 1] || 0))
  return delta.map(value => value / interval).slice(1);
}

function arraySum(array: number[]) {
  return array.reduce((a, b) => a + b, 0);
}

function arrayMean(array: number[]) {
  return arraySum(array) / (array.length);
}

function dot(array1: number[], array2: number[]) {
  let dot = 0;
  for (let i = 0; i < array1.length; i++) {
    dot += array1[i] * array2[i];
  }
  return dot;
}

function norm(array: number[]) {
  return Math.sqrt(dot(array, array));
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
