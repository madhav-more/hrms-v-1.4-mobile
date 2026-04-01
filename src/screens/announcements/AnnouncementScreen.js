import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getMyAnnouncements, markAsRead } from '../../api/announcement.api';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/dateUtils';

const AnnouncementScreen = ({ navigation }) => {
  const { data, loading, execute: fetchAnnouncements, setData } = useFetch(getMyAnnouncements, null);
  const announcements = Array.isArray(data) ? data : (data?.announcements || []);

  const onRefresh = useCallback(() => fetchAnnouncements(), [fetchAnnouncements]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      // Optimistically update
      setData((prev) => {
        const list = Array.isArray(prev) ? prev : (prev?.announcements || []);
        return list.map((a) => a._id === id ? { ...a, isRead: true } : a);
      });
    } catch (err) {
      // Silently fail
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High' || priority === 'Urgent') return colors.error;
    if (priority === 'Medium') return colors.warning;
    return colors.info;
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.isRead;
    const priorityColor = getPriorityColor(item.priority);

    return (
      <AppCard style={[styles.card, isUnread && styles.unreadCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          {isUnread && (
            <TouchableOpacity onPress={() => handleMarkRead(item._id)} style={styles.markReadBtn}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
        <View style={styles.footer}>
          <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
          {item.priority && (
            <View style={[styles.badge, { backgroundColor: `${priorityColor}18` }]}>
              <Text style={[styles.badgeText, { color: priorityColor }]}>{item.priority}</Text>
            </View>
          )}
        </View>
      </AppCard>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Announcements" showBack={false} />
      {loading && !data ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="megaphone-outline"
              title="No Announcements"
              message="You have no announcements at the moment."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 12 },
  card: { marginBottom: 10 },
  unreadCard: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  markReadBtn: { padding: 4 },
  message: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontSize: 12, color: colors.textTertiary },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

export default AnnouncementScreen;
