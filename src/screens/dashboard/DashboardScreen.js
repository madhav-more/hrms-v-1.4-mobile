import React, { useCallback, useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { getTodayStatus, getMySummary } from '../../api/attendance.api';
import { getUnreadCount } from '../../api/announcement.api';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from 'react-native-toast-message';
import { isManagement } from '../../utils/roleUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const getGreeting = (h) => {
  if (h < 12) return { text: 'Good Morning', icon: 'sunny-outline', color: '#D97706' };
  if (h < 17) return { text: 'Good Afternoon', icon: 'partly-sunny-outline', color: '#F59E0B' };
  return { text: 'Good Evening', icon: 'moon-outline', color: '#6366F1' };
};

const StatCard = ({ icon, label, value, sub, colors: gradientColors }) => (
  <View style={styles.statCard}>
    <View style={[styles.statAccent, { backgroundColor: gradientColors[0] }]} />
    <View style={styles.statTop}>
      <View style={[styles.statIconContainer, { backgroundColor: gradientColors[0] + '15' }]}>
        <Ionicons name={icon} size={20} color={gradientColors[0]} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={styles.statValue}>{value ?? '—'}</Text>
    {sub && <Text style={styles.statSub}>{sub}</Text>}
  </View>
);

const NanoAction = ({ label, sub, icon, onPress, accent = false }) => (
  <TouchableOpacity 
    style={[styles.nanoBtn, accent && styles.nanoBtnAccent]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.nanoIconBg, accent && styles.nanoIconBgAccent]}>
      <Ionicons name={icon} size={18} color={accent ? '#fff' : 'rgba(255,255,255,0.7)'} />
    </View>
    <View style={styles.nanoContent}>
      <Text style={styles.nanoLabel}>{label}</Text>
      <Text style={styles.nanoSub}>{sub}</Text>
    </View>
    <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
  </TouchableOpacity>
);

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { data: todayStatus, execute: fetchStatus, loading: statusLoading } = useFetch(getTodayStatus, null);
  const { data: summaryData, execute: fetchSummary } = useFetch(getMySummary, { summary: { present: 0, absent: 0, late: 0, totalHours: 0 } });
  
  const isAdmin = isManagement(user?.role);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(timer);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), fetchSummary()]);
    setRefreshing(false);
  }, [fetchStatus, fetchSummary]);

  const hr = currentTime.getHours();
  const { text: greeting, icon: GreetIcon, color: greetColor } = getGreeting(hr);

  const isCheckedIn = !!todayStatus?.record?.inTime;
  const isCheckedOut = !!todayStatus?.record?.outTime;

  const formatTime = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const fmtRecordTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 16) }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.greetingRow}>
               <View style={[styles.greetIconBox, { backgroundColor: greetColor + '15' }]}>
                  <Ionicons name={GreetIcon} size={22} color={greetColor} />
               </View>
               <Text style={styles.greetingText}>{greeting},</Text>
            </View>
            <Text style={styles.userName}>{user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
          </View>
          
          <LinearGradient 
            colors={['#0F172A', '#1E2D3D']} 
            style={styles.clockChip}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            <View>
              <Text style={styles.liveLabel}>LIVE TIME</Text>
              <Text style={styles.liveTime}>{formatTime(currentTime)}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Hero Attendance Card */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={['#0F172A', '#162032']}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            {/* Mesh decor blobs */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            <View style={styles.heroContent}>
              <View style={styles.heroHeader}>
                <Ionicons name="pulse" size={16} color="rgba(255,255,255,0.4)" />
                <Text style={styles.heroLabel}>TODAY'S ACTIVITY</Text>
              </View>

              <View style={styles.timeStats}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeItemLabel}>CHECK IN</Text>
                  <Text style={[styles.timeItemValue, isCheckedIn && { color: colors.success }]}>
                    {isCheckedIn ? fmtRecordTime(todayStatus.record.inTime) : 'NOT YET'}
                  </Text>
                </View>
                <View style={styles.timeSeparator} />
                <View style={styles.timeItem}>
                  <Text style={styles.timeItemLabel}>CHECK OUT</Text>
                  <Text style={[styles.timeItemValue, isCheckedOut && { color: '#60A5FA' }]}>
                    {isCheckedOut ? fmtRecordTime(todayStatus.record.outTime) : '--:--'}
                  </Text>
                </View>
              </View>

              <View style={styles.heroActions}>
                <NanoAction 
                  label="Attendance" 
                  sub="View History" 
                  icon="calendar-outline" 
                  onPress={() => navigation.navigate('AttendanceTab')} 
                />
                <NanoAction 
                  label="Clock In/Out" 
                  sub="Mark Status" 
                  icon="time-outline" 
                  accent 
                  onPress={() => navigation.navigate('AttendanceTab')} 
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* This Month's Summary */}
        <Text style={styles.sectionTitle}>This Month Summary</Text>
        <View style={styles.statGrid}>
          <StatCard 
            icon="checkmark-circle" 
            label="PRESENT" 
            value={summaryData?.summary?.present} 
            sub="Work Days" 
            colors={[colors.success, '#059669']} 
          />
          <StatCard 
            icon="close-circle" 
            label="ABSENT" 
            value={summaryData?.summary?.absent} 
            sub="Missed" 
            colors={[colors.error, '#B91C1C']} 
          />
          <StatCard 
            icon="timer" 
            label="LATE INS" 
            value={summaryData?.summary?.late} 
            sub="Late Entry" 
            colors={[colors.warning, '#D97706']} 
          />
          <StatCard 
            icon="trending-up" 
            label="AVG HOURS" 
            value={summaryData?.summary?.present ? (summaryData.summary.totalHours / summaryData.summary.present).toFixed(1) + 'h' : '—'} 
            sub="Per Day" 
            colors={['#8B5CF6', '#6366F1']} 
          />
        </View>

        {/* Management Quick Insights */}
        {isAdmin && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Management Actions</Text>
            <View style={styles.quickActionGrid}>
               {[
                 { label: 'Team Tracker', icon: 'people', path: 'TeamTab', color: '#2563EB' },
                 { label: 'Daily Logs', icon: 'document-text', path: 'AttendanceTab', color: '#7C3AED' },
                 { label: 'Corrections', icon: 'checkbox', path: 'AttendanceTab', color: '#10B981' }
               ].map((item, idx) => (
                 <TouchableOpacity 
                   key={idx} 
                   style={styles.adminActionCard}
                   onPress={() => navigation.navigate(item.path)}
                 >
                    <View style={[styles.adminIconBox, { backgroundColor: item.color }]}>
                       <Ionicons name={item.icon} size={20} color="#fff" />
                    </View>
                    <View style={styles.adminActionInfo}>
                       <Text style={styles.adminActionLabel}>{item.label}</Text>
                       <Ionicons name="chevron-forward" size={12} color={colors.textTertiary} />
                    </View>
                 </TouchableOpacity>
               ))}
            </View>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  headerLeft: { flex: 1 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  greetIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  greetingText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  userName: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  dateText: { fontSize: 13, color: colors.textTertiary, fontWeight: '600', marginTop: 2 },
  
  clockChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  liveLabel: { fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
  liveTime: { fontSize: 14, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] },

  heroWrapper: { marginBottom: 28 },
  heroCard: { borderRadius: 32, padding: 24, overflow: 'hidden', minHeight: 180 },
  blob: { position: 'absolute', width: 120, height: 120, borderRadius: 60, opacity: 0.15 },
  blob1: { top: -40, right: -40, backgroundColor: colors.primary },
  blob2: { bottom: -40, left: -40, backgroundColor: colors.success },
  heroContent: { zIndex: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  heroLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  
  timeStats: { flexDirection: 'row', alignItems: 'center', gap: 32, marginBottom: 24 },
  timeItem: { flex: 1 },
  timeItemLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  timeItemValue: { fontSize: 18, fontWeight: '900', color: 'rgba(255,255,255,0.4)' },
  timeSeparator: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  heroActions: { flexDirection: 'row', gap: 12 },
  nanoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 16, borderWeight: 1, borderColor: 'rgba(255,255,255,0.1)' },
  nanoBtnAccent: { backgroundColor: 'rgba(37,99,235,0.2)', borderColor: 'rgba(37,99,235,0.4)' },
  nanoIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  nanoIconBgAccent: { backgroundColor: 'rgba(37,99,235,0.4)' },
  nanoContent: { flex: 1 },
  nanoLabel: { color: '#fff', fontSize: 12, fontWeight: '800' },
  nanoSub: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '600' },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 16, letterSpacing: -0.5 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: (width - 52) / 2, backgroundColor: colors.surface, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.border, position: 'relative', overflow: 'hidden' },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, opacity: 0.8 },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statIconContainer: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statLabel: { fontSize: 9, fontWeight: '800', color: colors.textTertiary, letterSpacing: 0.5 },
  statValue: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  statSub: { fontSize: 10, color: colors.textTertiary, fontWeight: '600', marginTop: 4 },

  adminSection: { marginTop: 28 },
  quickActionGrid: { gap: 10 },
  adminActionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  adminIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  adminActionInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adminActionLabel: { fontSize: 15, fontWeight: '800', color: colors.text },
});

export default DashboardScreen;
