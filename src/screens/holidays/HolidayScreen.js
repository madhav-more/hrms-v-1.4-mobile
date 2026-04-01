import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getAllHolidays, createHoliday, deleteHoliday } from '../../api/holiday.api';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../hooks/useAuth';
import { isManagement } from '../../utils/roleUtils';
import Toast from 'react-native-toast-message';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const HolidayScreen = ({ navigation }) => {
  const { user } = useAuth();
  const canManage = isManagement(user?.role);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', description: '' });
  const [saving, setSaving] = useState(false);

  const { data, loading, execute: fetchHolidays } = useFetch(getAllHolidays, null);
  const holidays = Array.isArray(data) ? data : (data?.holidays || []);

  const onRefresh = useCallback(() => fetchHolidays(), [fetchHolidays]);

  const handleCreate = async () => {
    if (!form.name || !form.date) {
      Toast.show({ type: 'error', text1: 'Fill holiday name and date.' });
      return;
    }
    try {
      setSaving(true);
      await createHoliday(form);
      Toast.show({ type: 'success', text1: 'Holiday Added' });
      setModalVisible(false);
      setForm({ name: '', date: '', description: '' });
      fetchHolidays();
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to add holiday' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHoliday(id);
      Toast.show({ type: 'success', text1: 'Holiday Deleted' });
      fetchHolidays();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to delete' });
    }
  };

  const renderItem = ({ item }) => {
    const d = new Date(item.date);
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    return (
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.dateBadge}>
            <Text style={styles.dayNum}>{day}</Text>
            <Text style={styles.monthText}>{month}</Text>
            <Text style={styles.dayName}>{dayName}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.holidayName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            )}
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.type || 'Public'}</Text>
            </View>
          </View>
          {canManage && (
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </AppCard>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader
        title="Holidays"
        subtitle={`${holidays.length} this year`}
        showBack={false}
        rightAction={canManage ? () => setModalVisible(true) : null}
        rightActionIcon="add-circle-outline"
      />

      {loading && !data ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={holidays}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState icon="sunny-outline" title="No Holidays Found" />}
        />
      )}

      {/* Add Holiday Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Holiday</Text>
            <AppInput
              label="Holiday Name"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              placeholder="e.g. Diwali"
            />
            <AppInput
              label="Date (YYYY-MM-DD)"
              value={form.date}
              onChangeText={(t) => setForm({ ...form, date: t })}
              placeholder="2026-10-20"
            />
            <AppInput
              label="Description (optional)"
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
              placeholder="Optional description"
            />
            <View style={styles.modalButtons}>
              <AppButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} style={styles.modalBtn} />
              <AppButton title="Add" onPress={handleCreate} loading={saving} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 12 },
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  dateBadge: { width: 52, alignItems: 'center', backgroundColor: colors.primary, borderRadius: 10, padding: 8, marginRight: 12 },
  dayNum: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  monthText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  dayName: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  info: { flex: 1 },
  holidayName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  description: { fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  typeText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  deleteBtn: { padding: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1 },
});

export default HolidayScreen;
