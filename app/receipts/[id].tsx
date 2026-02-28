import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert, Image, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/themed-text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useReceipts } from '@/hooks/use-receipts';
import type { Receipt } from '@/models/receipt';

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { receipts, updateReceipt, deleteReceipt } = useReceipts();
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | undefined>();

  useEffect(() => {
    const found = receipts.find(r => r.id === id);
    setReceipt(found);
  }, [id, receipts]);

  if (!receipt) {
    return (
      <View style={styles.container}>
        <ThemedText>Receipt not found.</ThemedText>
      </View>
    );
  }

  const save = async () => {
    await updateReceipt(receipt.id, {
      vendor: receipt.vendor,
      date: receipt.date,
      total: receipt.total,
    });
    router.back();
  };

  const remove = async () => {
    Alert.alert('Delete', 'Are you sure you want to delete this receipt?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReceipt(receipt.id);
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {receipt.imageUri ? (
        <Image source={{ uri: receipt.imageUri }} style={styles.preview} />
      ) : null}
      <ThemedText style={styles.label}>Vendor</ThemedText>
      <ThemedText style={styles.label}>Category</ThemedText>
      <Picker
        selectedValue={receipt.category}
        onValueChange={(val) => setReceipt({ ...receipt, category: val as any })}
        style={styles.picker}
      >
        <Picker.Item label="(none)" value={undefined} />
        <Picker.Item label="Food" value="food" />
        <Picker.Item label="Travel" value="travel" />
        <Picker.Item label="Fuel" value="fuel" />
        <Picker.Item label="Groceries" value="groceries" />
        <Picker.Item label="Entertainment" value="entertainment" />
        <Picker.Item label="Utilities" value="utilities" />
        <Picker.Item label="Other" value="other" />
      </Picker>
      <TextInput
        style={styles.input}
        value={receipt.vendor}
        onChangeText={(t) => setReceipt({ ...receipt, vendor: t })}
      />
      <ThemedText style={styles.label}>Date</ThemedText>
      <TextInput
        style={styles.input}
        value={receipt.date}
        onChangeText={(t) => setReceipt({ ...receipt, date: t })}
      />
      <ThemedText style={styles.label}>Total</ThemedText>
      <TextInput
        style={styles.input}
        value={receipt.total != null ? receipt.total.toString() : ''}
        keyboardType="numeric"
        onChangeText={(t) => setReceipt({ ...receipt, total: parseFloat(t) || undefined })}
      />
      <View style={styles.buttonRow}>
        <Button accessibilityLabel="Save changes" title="Save" onPress={save} />
        <Button accessibilityLabel="Delete receipt" title="Delete" color="red" onPress={remove} />
      </View>
      <View style={styles.rawContainer}>
        <ThemedText style={styles.label}>Raw OCR text</ThemedText>
        <ThemedText accessibilityLabel="OCR output">{receipt.rawText}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  preview: { width: '100%', height: 200, resizeMode: 'contain', marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  picker: {
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  rawContainer: { marginTop: 20 },
});
