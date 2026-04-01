import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getAllLeaves } from '../../api/leave.api';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import { formatDate } from '../../utils/dateUtils';

const LeaveDashboardScreen = ({ navigation }) => {
  const [page, setPage] = useState(1);
  const { data, loading, execute: fetchLeaves } = useFetch(() => getAllLeaves({ page, limit: 30 }), null);

  const onRefresh = useCallback(() => {
    setPage(1);
    fetchLeaves();
  }, [fetchLeaves]);

  const renderItem = ({ item }) => (
    <AppCard style={styles.card}>
      <View style={styles.userInfoRow}>
        <Avatar url={item.employee?.profileImageUrl} name={item.employee?.name} size={40} />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.employee?.name}</Text>
          <Text style={styles.typeText}>{item.leaveType} | {item.isHalfDay ? '0.5' : item.totalDays} Days</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>From: <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text></Text>
        <Text style={styles.dateText}>To: <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text></Text>
      </View>
    </AppCard>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Leave Dashboard" showBack onBack={() => navigation.goBack()} />
      {loading && !data ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={data?.leaves || []}
          keyExtractor={(item) => item._id}
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
  listContainer: { padding: 16 },
  card: { marginBottom: 12 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  userDetails: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: colors.text },
  typeText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surfaceAlt, padding: 8, borderRadius: 6 },
  dateText: { fontSize: 13, color: colors.textSecondary },
  dateValue: { fontWeight: '600', color: colors.text },
});

export default LeaveDashboardScreen;
