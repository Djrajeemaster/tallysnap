import React from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useReceipts } from '@/hooks/use-receipts';
import { useRouter } from 'expo-router';

export default function ReceiptsListScreen() {
  const { receipts } = useReceipts();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [filter, setFilter] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topButtons}>
        <Button accessibilityLabel="Scan a receipt" title="Scan" onPress={() => router.push('/explore')} />
        <Button accessibilityLabel="View expense report" title="Report" onPress={() => router.push('/reports')} />
        <Button accessibilityLabel="Sign out" title="Sign Out" onPress={() => signOut()} />
      </View>
      <Picker
        selectedValue={filter}
        onValueChange={v => setFilter(v)}
        style={styles.picker}
      >
        <Picker.Item label="All categories" value={undefined} />
        <Picker.Item label="Food" value="food" />
        <Picker.Item label="Travel" value="travel" />
        <Picker.Item label="Fuel" value="fuel" />
        <Picker.Item label="Groceries" value="groceries" />
        <Picker.Item label="Entertainment" value="entertainment" />
        <Picker.Item label="Utilities" value="utilities" />
        <Picker.Item label="Other" value="other" />
      </Picker>
      <FlatList
        data={filter ? receipts.filter(r => r.category === filter) : receipts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<ThemedText style={styles.empty}>No receipts yet.</ThemedText>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/receipts/${item.id}`)}>
            <ThemedText style={styles.vendor}>{item.vendor || 'Unknown vendor'}</ThemedText>
            <ThemedText style={styles.category}>{item.category || ''}</ThemedText>
            <ThemedText style={styles.details}>
              {item.date || ''} {item.total != null ? `₹${item.total.toFixed(2)}` : ''}
            </ThemedText>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  topButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  picker: { marginBottom: 8 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  vendor: { fontSize: 16, fontWeight: 'bold' },
  category: { fontSize: 12, color: '#777' },
  details: { fontSize: 14, color: '#555' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});
