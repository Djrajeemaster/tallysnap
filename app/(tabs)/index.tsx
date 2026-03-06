import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useReceipts } from '@/hooks/use-receipts';
import type { Category, Receipt } from '@/models/receipt';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const CATEGORY_COLORS: Record<string, string> = {
  food: '#FF9500',
  travel: '#007AFF',
  fuel: '#FF3B30',
  groceries: '#34C759',
  entertainment: '#AF52DE',
  utilities: '#5856D6',
  other: '#8E8E93',
};

export default function ReceiptsListScreen() {
  const { receipts, deleteReceipt } = useReceipts();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [filter, setFilter] = React.useState<Category | undefined>(undefined);

  // Allow guest mode - don't require login
  // Remove this check if you want to require authentication
  /*
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__E2E__) return;
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);
  */

  const filteredReceipts = filter
    ? receipts.filter((r) => r.category === filter)
    : receipts;

  const handleSignOut = () => {
    if (!user) {
      // Guest mode - go to login
      router.push('/login');
      return;
    }
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: () => signOut() },
      ]
    );
  };

  const handleDeleteReceipt = (receipt: Receipt) => {
    // On web, Alert might not show - use confirm directly
    const confirmed = window.confirm(
      `Are you sure you want to delete the receipt from ${receipt.vendor || 'Unknown Vendor'}?`
    );
    if (confirmed) {
      deleteReceipt(receipt.id);
      alert('Receipt has been deleted');
    }
  };

  const renderReceipt = ({ item }: { item: Receipt }) => (
    <TouchableOpacity
      style={styles.receiptCard}
      onPress={() => router.push(`/receipts/${item.id}`)}
      onLongPress={() => handleDeleteReceipt(item)}
      activeOpacity={0.7}
    >
      <View style={styles.receiptHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: CATEGORY_COLORS[item.category || 'other'] || '#8E8E93' },
          ]}
        >
          <Text style={styles.categoryText}>
            {(item.category || 'other').toUpperCase()}
          </Text>
        </View>
        {item.total && (
          <Text style={styles.amount}>₹{item.total.toFixed(2)}</Text>
        )}
      </View>
      <Text style={styles.vendor} numberOfLines={1}>
        {item.vendor || 'Unknown Vendor'}
      </Text>
      <View style={styles.receiptFooter}>
        <Text style={styles.date}>{item.date || 'No date'}</Text>
        {item.gstin && <Text style={styles.gstin}>GSTIN: {item.gstin}</Text>}
      </View>
      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={(e) => {
          e.stopPropagation && e.stopPropagation();
          handleDeleteReceipt(item);
        }}
      >
        <Text style={styles.deleteIconText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>My Receipts</ThemedText>
        <Text style={styles.subtitle}>
          {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/explore')}
        >
          <Text style={styles.scanButtonText}>📷 Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => router.push('/reports')}
        >
          <Text style={styles.reportButtonText}>📊 Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <Picker
          selectedValue={filter || ''}
          onValueChange={(v) => setFilter(v as Category || undefined)}
          style={styles.filterPicker}
        >
          <Picker.Item label="All Categories" value="" />
          <Picker.Item label="Food & Dining" value="food" />
          <Picker.Item label="Travel" value="travel" />
          <Picker.Item label="Fuel" value="fuel" />
          <Picker.Item label="Groceries" value="groceries" />
          <Picker.Item label="Entertainment" value="entertainment" />
          <Picker.Item label="Utilities" value="utilities" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      <FlatList
        data={filteredReceipts}
        keyExtractor={(item, index) => item.id || `receipt-${index}`}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyTitle}>No receipts yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap &quot;Scan&quot; to add your first receipt
            </Text>
          </View>
        }
        renderItem={renderReceipt}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>{user ? 'Sign Out' : 'Login'}</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  filterPicker: {
    height: 50,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  vendor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
  },
  gstin: {
    fontSize: 10,
    color: '#8E8E93',
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  signOutButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 20,
  },
  deleteIconText: {
    fontSize: 16,
  },
});
