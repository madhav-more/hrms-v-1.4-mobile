import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getPendingCorrections, approveCorrection, rejectCorrection } from '../../api/attendance.api';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import Toast from 'react-native-toast-message';

const CorrectionApproval = () => {
  const { data, loading, execute: fetchCorrections } = useFetch(getPendingCorrections, null);
  const [actionLoading, setActionLoading] = useState(null);

  const onRefresh = useCallback(() => {
    fetchCorrections();
  }, [fetchCorrections]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await approveCorrection(id);
      Toast.show({ type: 'success', text1: 'Correction Approved' });
      fetchCorrections();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Approval Failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await rejectCorrection(id, { note: 'Rejected by admin' }); // Hardcoded note for now
      Toast.show({ type: 'success', text1: 'Correction Rejected' });
      fetchCorrections();
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
          <Text style={styles.userName}>{item.employee?.name} ({item.employee?.employeeCode})</Text>
          <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
      </View>
      
      <View style={styles.detailsBox}>
        <Text style={styles.labelText}>Reason: <Text style={styles.valueText}>{item.correctionReason}</Text></Text>
        <Text style={styles.labelText}>Requested In: <Text style={styles.valueText}>{item.correctionCheckIn ? new Date(item.correctionCheckIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</Text></Text>
        <Text style={styles.labelText}>Requested Out: <Text style={styles.valueText}>{item.correctionCheckOut ? new Date(item.correctionCheckOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</Text></Text>
      </View>

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
          onPress={() => handleApprove(item._id)} 
          disabled={actionLoading === item._id}
          loading={actionLoading === item._id}
          style={styles.actionBtn} 
        />
      </View>
    </AppCard>
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Pending Corrections</Text>
      </View>

      {loading && !data ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={data || []}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState icon="checkmark-circle-outline" title="All Caught Up!" message="There are no pending attendance corrections." />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  listContainer: { padding: 16 },
  card: { marginBottom: 12 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  userDetails: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: colors.text },
  dateText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  detailsBox: { backgroundColor: colors.surfaceAlt, padding: 12, borderRadius: 8, marginBottom: 16 },
  labelText: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  valueText: { fontWeight: '600', color: colors.text },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1 },
});

export default CorrectionApproval;
