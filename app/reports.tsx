import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, Dimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { BarChart } from 'react-native-chart-kit';
import { useReceipts } from '@/hooks/use-receipts';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';

export default function ReportsScreen() {
  const { receipts } = useReceipts();
  const router = useRouter();

  const totals: Record<string, number> = {};
  let overall = 0;
  receipts.forEach(r => {
    if (r.total != null) {
      const cat = r.category || 'uncategorized';
      totals[cat] = (totals[cat] || 0) + r.total;
      overall += r.total;
    }
  });

  const exportCsv = async () => {
    let csv = 'category,amount\n';
    Object.entries(totals).forEach(([cat, amt]) => {
      csv += `${cat},${amt}\n`;
    });
    csv += `total,${overall}\n`;
    await Clipboard.setStringAsync(csv);
    Alert.alert('Exported', 'CSV copied to clipboard');
  };

  const labels = Object.keys(totals);
  const data = Object.values(totals).map(v => parseFloat(v.toFixed(2)));
  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.buttonRow}>
        <Button title="Back" onPress={() => router.back()} />
        <Button title="Export CSV" onPress={exportCsv} />
      </View>
      <ThemedText type="title">Expense Report</ThemedText>
      {labels.length > 0 && (
        <BarChart
          data={{ labels, datasets: [{ data }] }}
          width={screenWidth}
          height={220}
          yAxisLabel="₹"
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          }}
          style={{ marginVertical: 8 }}
        />
      )}
      {Object.entries(totals).map(([cat, amt]) => (
        <View key={cat} style={styles.row}>
          <Text style={styles.cat}>{cat}</Text>
          <Text style={styles.amt}>₹{amt.toFixed(2)}</Text>
        </View>
      ))}
      <View style={styles.separator} />
      <View style={styles.row}>
        <ThemedText type="title">Total</ThemedText>
        <ThemedText type="title">₹{overall.toFixed(2)}</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  cat: { fontSize: 16 },
  amt: { fontSize: 16, fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#ccc', marginVertical: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
});
