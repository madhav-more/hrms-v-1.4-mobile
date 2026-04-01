import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getMySummary } from '../../api/attendance.api';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';

const STATUS_MAP = {
  P: { label: 'Present', color: colors.success },
  A: { label: 'Absent', color: colors.error },
  WO: { label: 'Week Off', color: colors.info },
  L: { label: 'Leave', color: colors.secondary },
  Coff: { label: 'Comp Off', color: colors.accent },
  AUTO: { label: 'Partial', color: colors.warning },
  H: { label: 'Holiday', color: colors.info },
};

const AttendanceHistoryScreen = ({ navigation }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(31); // Show full month
  
  const fetchSummaryFunc = useCallback(() => getMySummary({ page, limit }), [page, limit]);
  const { data, loading, execute: fetchSummary } = useFetch(fetchSummaryFunc, null);

  const onRefresh = useCallback(() => {
    setPage(1);
    fetchSummary();
  }, [fetchSummary]);

  const renderItem = ({ item }) => {
    const isPresent = item.status === 'P' || item.status === 'Half-Day';
    const checkInTime = item.inTime ? formatTime(new Date(item.inTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})) : '--:--';
    const checkOutTime = item.outTime ? formatTime(new Date(item.outTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})) : '--:--';
    
    const currentStatus = STATUS_MAP[item.status] || { label: item.status || 'Absent', color: colors.textTertiary };
    const canCorrect = item.status && !['A', 'H', 'WO'].includes(item.status);

    return (
      <AppCard style={styles.recordCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            <Text style={styles.dayText}>{new Date(item.date).toLocaleDateString('en-IN', { weekday: 'long' })}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: currentStatus.color + '15' }]}>
            <Text style={[styles.statusText, { color: currentStatus.color }]}>{currentStatus.label}</Text>
          </View>
        </View>
        
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Check In</Text>
            <Text style={styles.timeValue}>{checkInTime}</Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Check Out</Text>
            <Text style={styles.timeValue}>{checkOutTime}</Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Worked</Text>
            <Text style={styles.timeValue}>{item.totalHours ? item.totalHours.toFixed(1) + 'h' : '--'}</Text>
          </View>
        </View>

        {item.isLate && (
           <View style={styles.lateInfo}>
              <Ionicons name="alert-circle" size={12} color={colors.warning} />
              <Text style={styles.lateText}>Late by {item.lateMinutes} mins</Text>
           </View>
        )}

        <View style={styles.cardFooter}>
          {item.correctionRequested ? (
            <View style={styles.correctionBadge}>
              <Text style={styles.correctionText}>
                Correction {item.correctionStatus?.split('_')[1] || 'Pending'}
              </Text>
            </View>
          ) : canCorrect ? (
            <TouchableOpacity 
              style={styles.correctBtn}
              onPress={() => navigation.navigate('CorrectionRequest', { record: item })}
            >
              <Text style={styles.correctBtnText}>Request Correction</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </AppCard>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Attendance History</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data?.summary?.present || 0}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data?.summary?.absent || 0}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data?.summary?.late || 0}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>
      </View>

      {loading && !data ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={data?.records || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No Records for this month" />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: colors.surface, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  backBtn: { marginRight: 12 },
  title: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  listContainer: { padding: 16 },
  recordCard: { marginBottom: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  dateText: { fontSize: 16, fontWeight: '800', color: colors.text },
  dayText: { fontSize: 12, color: colors.textTertiary, textTransform: 'uppercase', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800' },
  timeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: colors.surfaceAlt, 
    padding: 12, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  timeBlock: { flex: 1, alignItems: 'center' },
  timeLabel: { fontSize: 10, color: colors.textTertiary, textTransform: 'uppercase', fontWeight: '700', marginBottom: 2 },
  timeValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  lateInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  lateText: { fontSize: 11, fontWeight: '700', color: colors.warning },
  cardFooter: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  correctBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  correctBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  correctionBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  correctionText: { fontSize: 11, fontWeight: '800', color: colors.primary },
});

export default AttendanceHistoryScreen;
