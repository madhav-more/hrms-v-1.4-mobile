import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getMyLeaves, cancelLeave } from '../../api/leave.api';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/dateUtils';
import Toast from 'react-native-toast-message';

const MyLeavesScreen = ({ navigation }) => {
  const { data, loading, execute: fetchLeaves } = useFetch(getMyLeaves, null);
  const [cancelLoading, setCancelLoading] = useState(null);

  const onRefresh = useCallback(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleCancel = async (id) => {
    try {
      setCancelLoading(id);
      await cancelLeave(id);
      Toast.show({ type: 'success', text1: 'Leave Cancelled' });
      fetchLeaves();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Cancellation Failed' });
    } finally {
      setCancelLoading(null);
    }
  };

  const renderItem = ({ item }) => (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.typeText}>{item.leaveType} Leave</Text>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>From: <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text></Text>
        <Text style={styles.dateText}>To: <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text></Text>
      </View>

      <Text style={styles.reasonText} numberOfLines={2}>{item.reason}</Text>
      
      {item.status === 'Pending' && (
        <AppButton 
          title="Cancel Leave" 
          variant="outline" 
          onPress={() => handleCancel(item._id)}
          disabled={cancelLoading === item._id}
          loading={cancelLoading === item._id}
          style={styles.cancelButton}
        />
      )}
    </AppCard>
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <Text style={styles.title}>My Leaves</Text>
        <AppButton 
          title="Apply Leave" 
          size="small" 
          onPress={() => navigation.navigate('ApplyLeave')} 
        />
      </View>

      {loading && !data ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={data?.leaves || []}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No Leaves Found" message="You haven't requested any leaves yet." />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  listContainer: { padding: 16 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateText: { fontSize: 13, color: colors.textSecondary },
  dateValue: { fontWeight: '600', color: colors.text },
  reasonText: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  cancelButton: { marginTop: 8 },
});

export default MyLeavesScreen;
