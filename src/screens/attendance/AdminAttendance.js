import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getAdminAttendance } from '../../api/attendance.api';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import { formatTime } from '../../utils/dateUtils';

const AdminAttendance = () => {
  const [date] = useState(new Date().toISOString().split('T')[0]); // Today YYYY-MM-DD
  const { data, loading, execute: fetchAttendance } = useFetch(
    () => getAdminAttendance({ date }),
    null
  );

  const onRefresh = useCallback(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const renderItem = ({ item }) => {
    return (
      <AppCard style={styles.card}>
        <View style={styles.userInfoRow}>
          <Avatar url={item.employee?.profileImageUrl} name={item.employee?.name} size={40} />
          <View style={styles.userDetails}>
             <Text style={styles.userName}>{item.employee?.name}</Text>
             <Text style={styles.userCode}>{item.employee?.employeeCode} • {item.employee?.department}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {(item.status === 'Present' || item.status === 'Half-Day') && (
          <View style={styles.timeRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>In</Text>
              <Text style={styles.timeValue}>{item.checkInTime ? formatTime(new Date(item.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})) : '--'}</Text>
            </View>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Out</Text>
              <Text style={styles.timeValue}>{item.checkOutTime ? formatTime(new Date(item.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})) : '--'}</Text>
            </View>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Total</Text>
              <Text style={styles.timeValue}>{item.totalHours ? item.totalHours.toFixed(1) + 'h' : '--'}</Text>
            </View>
          </View>
        )}
      </AppCard>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Team Attendance</Text>
        <Text style={styles.subtitle}>{new Date(date).toDateString()}</Text>
      </View>

      {loading && !data ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={data || []}
          keyExtractor={(item) => item.employee?._id || item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No Records" />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  listContainer: { padding: 16 },
  card: { marginBottom: 12 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  userDetails: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: colors.text },
  userCode: { fontSize: 13, color: colors.textSecondary },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: 8 },
  timeBlock: { flex: 1, alignItems: 'center' },
  timeLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  timeValue: { fontSize: 14, fontWeight: '600', color: colors.text },
});

export default AdminAttendance;
