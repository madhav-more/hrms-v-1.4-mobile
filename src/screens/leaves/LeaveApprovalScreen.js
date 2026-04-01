import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getPendingLeaves, approveLeave, rejectLeave } from '../../api/leave.api';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import { formatDate } from '../../utils/dateUtils';
import Toast from 'react-native-toast-message';

const LeaveApprovalScreen = ({ navigation }) => {
  const { data, loading, execute: fetchLeaves } = useFetch(getPendingLeaves, null);
  const [actionLoading, setActionLoading] = useState(null);

  const onRefresh = useCallback(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await approveLeave(id, { notes: 'Approved via Mobile' });
      Toast.show({ type: 'success', text1: 'Leave Approved' });
      fetchLeaves();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Approval Failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await rejectLeave(id, { notes: 'Rejected via Mobile' });
      Toast.show({ type: 'success', text1: 'Leave Rejected' });
      fetchLeaves();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Rejection Failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const renderItem = ({ item }) => (
    <AppCard style={styles.card}>
      <View style={styles.userInfoRow}>
        <Avatar url={item.employee?.profileImageUrl} name={item.employee?.name} size={40} />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.employee?.name}</Text>
          <Text style={styles.userCode}>{item.employee?.employeeCode}</Text>
        </View>
        <Text style={styles.typeText}>{item.leaveType} ({item.isHalfDay ? '0.5' : item.totalDays}d)</Text>
      </View>
      
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>From: <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text></Text>
        <Text style={styles.dateText}>To: <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text></Text>
      </View>

      <Text style={styles.reasonText}>"{item.reason}"</Text>
      
      <View style={styles.actionRow}>
        <AppButton 
          title="Reject" 
          variant="outline" 
          disabled={actionLoading === item._id}
          onPress={() => handleReject(item._id)} 
          style={styles.actionBtn} 
        />
        <AppButton 
          title="Approve" 
          disabled={actionLoading === item._id}
          loading={actionLoading === item._id}
          onPress={() => handleApprove(item._id)} 
          style={styles.actionBtn} 
        />
      </View>
    </AppCard>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Leave Approvals" showBack onBack={() => navigation.goBack()} />
      {loading && !data ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={data?.leaves || []}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState icon="checkmark-circle-outline" title="All Caught Up!" message="No pending leave requests." />}
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
  userCode: { fontSize: 13, color: colors.textSecondary },
  typeText: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, backgroundColor: colors.surfaceAlt, padding: 8, borderRadius: 6 },
  dateText: { fontSize: 13, color: colors.textSecondary },
  dateValue: { fontWeight: '600', color: colors.text },
  reasonText: { fontSize: 14, fontStyle: 'italic', color: colors.textSecondary, marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1 },
});

export default LeaveApprovalScreen;
