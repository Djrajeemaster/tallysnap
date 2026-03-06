import { ThemedText } from '@/components/themed-text';
import { useReceipts } from '@/hooks/use-receipts';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

type DateRange = 'all' | 'week' | 'month' | 'year';

export default function ReportsScreen() {
  const { receipts } = useReceipts();
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [showFilter, setShowFilter] = useState(false);

  const filteredReceipts = useMemo(() => {
    const now = new Date();
    return receipts.filter((r) => {
      if (!r.date) return true;
      
      const receiptDate = new Date(r.date);
      if (isNaN(receiptDate.getTime())) return true;

      switch (dateRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return receiptDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return receiptDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return receiptDate >= yearAgo;
        default:
          return true;
      }
    });
  }, [receipts, dateRange]);

  const totals: Record<string, number> = {};
  let overall = 0;
  filteredReceipts.forEach((r) => {
    if (r.total != null) {
      const cat = r.category || 'uncategorized';
      totals[cat] = (totals[cat] || 0) + r.total;
      overall += r.total;
    }
  });

  const exportCsv = async () => {
    let csv = 'date,vendor,category,amount\n';
    filteredReceipts.forEach((r) => {
      csv += `${r.date || ''},${r.vendor || ''},${r.category || ''},${r.total || 0}\n`;
    });
    csv += `\nTotal,,,${overall}\n`;
    await Clipboard.setStringAsync(csv);
    Alert.alert('Exported', 'CSV data copied to clipboard');
  };

  const labels = Object.keys(totals);
  // Ensure unique labels (fixes duplicate key error)
  const uniqueLabels = [...new Set(labels)];
  const data = uniqueLabels.map(label => {
    const value = totals[label] || 0;
    return parseFloat(value.toFixed(2));
  });
  const screenWidth = Dimensions.get('window').width - 32;

  const pieData = uniqueLabels.map((label, index) => ({
    name: label,
    population: totals[label],
    color: ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6', '#8E8E93'][index % 7],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  const rangeLabels = [
    { key: 'all', label: 'All Time' },
    { key: 'week', label: 'Last 7 Days' },
    { key: 'month', label: 'Last 30 Days' },
    { key: 'year', label: 'Last Year' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Expense Report</ThemedText>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)}>
          <Text style={styles.filterButtonText}>
            📅 {rangeLabels.find((r) => r.key === dateRange)?.label}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton} onPress={exportCsv}>
          <Text style={styles.exportButtonText}>📤 Export</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Spending</Text>
        <Text style={styles.summaryAmount}>₹{overall.toFixed(2)}</Text>
        <Text style={styles.summaryCount}>
          {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {uniqueLabels.length > 0 && (
        <>
          {/* Bar Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Spending by Category</Text>
            <BarChart
              data={{ labels: uniqueLabels, datasets: [{ data }] }}
              width={screenWidth}
              height={220}
              yAxisLabel="₹"
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                barPercentage: 0.6,
              }}
              style={{ marginVertical: 8 }}
            />
          </View>

          {/* Pie Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Category Distribution</Text>
            <PieChart
              data={pieData}
              width={screenWidth}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>

          {/* Category Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.chartTitle}>Category Breakdown</Text>
            {Object.entries(totals)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amt], index) => (
                <View key={`${cat}-${index}`} style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.categoryDot,
                        {
                          backgroundColor: ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6', '#8E8E93'][
                            index % 7
                          ],
                        },
                      ]}
                    />
                    <Text style={styles.categoryName}>{cat}</Text>
                  </View>
                  <View style={styles.breakdownRight}>
                    <Text style={styles.categoryAmount}>₹{amt.toFixed(2)}</Text>
                    <Text style={styles.categoryPercent}>
                      {((amt / overall) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </>
      )}

      {uniqueLabels.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No receipts found for this period</Text>
          <Text style={styles.emptySubtext}>
            Start scanning receipts to see your expense analytics
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            {rangeLabels.map((range, idx) => (
              <TouchableOpacity
                key={`${range.key}-${idx}`}
                style={[
                  styles.modalOption,
                  dateRange === range.key && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setDateRange(range.key as DateRange);
                  setShowFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    dateRange === range.key && styles.modalOptionTextSelected,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowFilter(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  exportButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  exportButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  categoryPercent: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F5F5F7',
  },
  modalOptionSelected: {
    backgroundColor: '#007AFF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalClose: {
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});
