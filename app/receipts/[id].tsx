import { ThemedText } from '@/components/themed-text';
import { useReceipts } from '@/hooks/use-receipts';
import type { Category, Receipt } from '@/models/receipt';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Food & Dining', value: 'food' },
  { label: 'Travel', value: 'travel' },
  { label: 'Fuel', value: 'fuel' },
  { label: 'Groceries', value: 'groceries' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Other', value: 'other' },
];

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { receipts, updateReceipt, deleteReceipt } = useReceipts();
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const found = receipts.find(r => r.id === id);
    setReceipt(found);
  }, [id, receipts]);

  if (!receipt) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.notFound}>Receipt not found.</ThemedText>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const save = async () => {
    setIsSaving(true);
    try {
      await updateReceipt(receipt.id, {
        vendor: receipt.vendor,
        date: receipt.date,
        total: receipt.total,
        category: receipt.category,
        gstin: receipt.gstin,
      });
      Alert.alert('Success', 'Receipt saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save receipt. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteReceipt(receipt.id);
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {receipt.imageUri ? (
        <Image source={{ uri: receipt.imageUri }} style={styles.preview} resizeMode="contain" />
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={receipt.category || 'other'}
            onValueChange={(val) => setReceipt({ ...receipt, category: val as Category })}
            style={styles.picker}
          >
            {CATEGORIES.map((cat) => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Vendor / Store Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter vendor name"
          placeholderTextColor="#999"
          value={receipt.vendor || ''}
          onChangeText={(t) => setReceipt({ ...receipt, vendor: t })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#999"
          value={receipt.date || ''}
          onChangeText={(t) => setReceipt({ ...receipt, date: t })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Total Amount (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#999"
          value={receipt.total != null ? receipt.total.toString() : ''}
          keyboardType="decimal-pad"
          onChangeText={(t) => setReceipt({ ...receipt, total: parseFloat(t) || undefined })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>GSTIN (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter GSTIN if available"
          placeholderTextColor="#999"
          value={receipt.gstin || ''}
          onChangeText={(t) => setReceipt({ ...receipt, gstin: t })}
          autoCapitalize="characters"
          maxLength={15}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={save}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deleteSection}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={remove}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete Receipt</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rawContainer}>
        <Text style={styles.label}>Raw OCR Text</Text>
        <Text style={styles.rawText}>{receipt.rawText || 'No OCR text available'}</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back to Receipts</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  notFound: {
    textAlign: 'center',
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 20,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#E5E5EA',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C3C43',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#FFFFFF',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  cancelButtonText: {
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteSection: {
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  rawContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  rawText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    lineHeight: 18,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
