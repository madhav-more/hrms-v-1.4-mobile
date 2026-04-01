import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getEmployees } from '../../api/employee.api';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { isManagement } from '../../utils/roleUtils';

const EmployeeListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const canCreate = isManagement(user?.role);
  const [search, setSearch] = useState('');

  const { data, loading, execute: fetchEmployees } = useFetch(getEmployees, null);

  const onRefresh = useCallback(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const employees = (data?.employees || []).filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeCode?.toLowerCase().includes(search.toLowerCase()) ||
    emp.department?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <AppCard
      key={item._id}
      style={styles.card}
      onPress={() => navigation.navigate('EmployeeDetail', { employeeId: item._id })}
    >
      <View style={styles.row}>
        <Avatar url={item.profileImageUrl} name={item.name} size={44} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.employeeCode} • {item.department}</Text>
          <Text style={styles.position}>{item.position}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
    </AppCard>
  );

  return (
    <View style={styles.container}>
      <PageHeader
        title="Employees"
        subtitle={`${(data || []).length} total`}
        showBack={false}
        rightAction={canCreate ? () => navigation.navigate('CreateEmployee') : null}
        rightActionIcon="add-circle-outline"
      />

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by name, code, or dept…"
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading && !data ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No Employees Found" />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, margin: 12, paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1, borderColor: colors.border, height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  list: { paddingHorizontal: 12, paddingBottom: 16 },
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  position: { fontSize: 13, color: colors.primary, marginTop: 2, fontWeight: '500' },
});

export default EmployeeListScreen;
