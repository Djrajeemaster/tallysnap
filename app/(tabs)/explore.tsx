import React from 'react';
import { View, StyleSheet } from 'react-native';
import Scanner from '../scanner';

export default function ScanTab() {
  return (
    <View style={styles.container}>
      <Scanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
