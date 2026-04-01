import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { colors } from '../../constants/colors';
import { getTodayStatus, checkIn, checkOut } from '../../api/attendance.api';
import { getManagementEmployees } from '../../api/employee.api'; 
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import FaceVerificationModal from '../../components/common/FaceVerificationModal';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { calculateDistance } from '../../utils/geoUtils';
import Toast from 'react-native-toast-message';
import Modal from 'react-native-modal';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

const AttendanceScreen = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [officeSettings, setOfficeSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Geo state
  const [geoStatus, setGeoStatus] = useState('checking'); // checking, valid, invalid, error
  const [geoDistance, setGeoDistance] = useState(0);
  const [userLocation, setUserLocation] = useState(null);

  // Timer state
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const [isOvertime, setIsOvertime] = useState(false);

  // Face Modal state
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [faceOp, setFaceOp] = useState(null); // 'checkin' or 'checkout'

  // EOD Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [managementEmps, setManagementEmps] = useState([]);
  const [reportForm, setReportForm] = useState({
    todayWork: '',
    pendingWork: '',
    issuesFaced: '',
    reportParticipants: []
  });

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await getTodayStatus();
      setTodayRecord(data.data.record);
      setOfficeSettings(data.data.office);
      if (data.data.office) {
        verifyLocation(data.data.office);
      }
    } catch (error) {
      console.error('Status fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchManagement();
  }, [fetchStatus]);

  const fetchManagement = async () => {
    try {
      const { data } = await getManagementEmployees();
      setManagementEmps(data.data || []);
    } catch (e) {}
  };

  const verifyLocation = async (office) => {
    setGeoStatus('checking');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeoStatus('error');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation(location.coords);
      
      const dist = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        office.lat,
        office.lng
      );
      
      setGeoDistance(dist);
      setGeoStatus(dist <= office.radius ? 'valid' : 'invalid');
    } catch (error) {
      console.error('Location error:', error);
      setGeoStatus('error');
    }
  };

  // Timer Logic
  useEffect(() => {
    if (!todayRecord?.inTime || todayRecord?.outTime) {
      setTimerDisplay('00:00:00');
      setIsOvertime(false);
      return;
    }

    const inTime = new Date(todayRecord.inTime);
    const shiftMs = (inTime.getDay() === 6 ? 7 : 8.5) * 3600000;

    const interval = setInterval(() => {
      const workedMs = Date.now() - inTime.getTime();
      const remainingMs = shiftMs - workedMs;
      
      setIsOvertime(remainingMs < 0);
      const absMs = Math.abs(remainingMs);
      
      const h = Math.floor(absMs / 3600000);
      const m = Math.floor((absMs % 3600000) / 60000);
      const s = Math.floor((absMs % 60000) / 1000);
      
      setTimerDisplay(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [todayRecord]);

  const handleAction = (op) => {
    if (geoStatus !== 'valid') {
      Toast.show({ type: 'error', text1: 'Error', text2: 'You must be within office zone' });
      return;
    }
    setFaceOp(op);
    setFaceModalVisible(true);
  };

  const onFaceCaptured = async (base64) => {
    setFaceModalVisible(false);
    if (faceOp === 'checkin') {
      proceedCheckIn(base64);
    } else {
      setReportForm({...reportForm, faceImage: base64});
      setShowReportModal(true);
    }
  };

  const proceedCheckIn = async (image) => {
    setActionLoading(true);
    try {
      await checkIn({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        faceImage: `data:image/jpeg;base64,${image}`
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Checked in successfully' });
      fetchStatus();
      refreshProfile();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Check-in Failed', text2: error.response?.data?.message || 'Error occurred' });
    } finally {
      setActionLoading(false);
    }
  };

  const proceedCheckOut = async () => {
    if (!reportForm.todayWork.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Info', text2: "Please describe today's work" });
      return;
    }

    setActionLoading(true);
    try {
      await checkOut({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        faceImage: `data:image/jpeg;base64,${reportForm.faceImage}`,
        todayWork: reportForm.todayWork,
        pendingWork: reportForm.pendingWork,
        issuesFaced: reportForm.issuesFaced,
        reportParticipants: reportForm.reportParticipants
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Checked out successfully' });
      setShowReportModal(false);
      fetchStatus();
      refreshProfile();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Check-out Failed', text2: error.response?.data?.message || 'Error occurred' });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleParticipant = (id) => {
    setReportForm(prev => ({
      ...prev,
      reportParticipants: prev.reportParticipants.includes(id)
        ? prev.reportParticipants.filter(x => x !== id)
        : [...prev.reportParticipants, id]
    }));
  };

  const isCheckedIn = !!todayRecord?.inTime;
  const isCheckedOut = !!todayRecord?.outTime;

  const renderGeoStatus = () => {
    const map = {
      checking: { color: colors.warning, icon: 'sync', text: 'Verifying Location...' },
      valid: { color: colors.success, icon: 'checkmark-circle', text: `Within Office · ${geoDistance}m` },
      invalid: { color: colors.error, icon: 'close-circle', text: `Out of Zone · ${geoDistance}m` },
      error: { color: colors.error, icon: 'alert-circle', text: 'Location Error' },
    };
    const s = map[geoStatus] || map.checking;
    return (
      <View style={[styles.geoPill, { backgroundColor: s.color + '15', borderColor: s.color + '30' }]}>
        <Ionicons name={s.icon} size={14} color={s.color} />
        <Text style={[styles.geoText, { color: s.color }]}>{s.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStatus} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Attendance</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <TouchableOpacity onPress={() => verifyLocation(officeSettings)} style={styles.refreshIcon}>
             <Ionicons name="location" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statusSection}>
           {renderGeoStatus()}
        </View>

        {/* Action Card */}
        <AppCard style={styles.actionCard}>
           {isCheckedIn && !isCheckedOut ? (
             <View style={styles.activeSession}>
                <Text style={[styles.timerLabel, isOvertime && { color: colors.warning }]}>
                  {isOvertime ? 'OVERTIME RUNNING' : 'SHIFT TIME REMAINING'}
                </Text>
                <Text style={[styles.timerText, isOvertime && { color: colors.warning }]}>
                  {isOvertime && '+'}{timerDisplay}
                </Text>
                <Text style={styles.inTimeSub}>Clocked in at {new Date(todayRecord.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
             </View>
           ) : isCheckedOut ? (
             <View style={styles.doneSession}>
                <View style={styles.doneCircle}>
                   <Ionicons name="checkmark-done-circle" size={60} color={colors.success} />
                </View>
                <Text style={styles.doneTitle}>Day Complete!</Text>
                <Text style={styles.doneSub}>Attendance securely logged.</Text>
             </View>
           ) : (
             <View style={styles.idleSession}>
                <View style={styles.idleCircle}>
                   <Ionicons name="time" size={40} color={colors.textTertiary} />
                </View>
                <Text style={styles.idleTitle}>Ready to begin?</Text>
                <Text style={styles.idleSub}>Position yourself in the office zone to check-in.</Text>
             </View>
           )}

           <View style={styles.actions}>
              {!isCheckedIn && (
                 <TouchableOpacity 
                   style={[styles.mainBtn, { backgroundColor: colors.success }, geoStatus !== 'valid' && styles.disabledBtn]} 
                   onPress={() => handleAction('checkin')}
                   disabled={geoStatus !== 'valid' || actionLoading}
                 >
                   {actionLoading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="shield-checkmark" size={24} color="#fff" /><Text style={styles.mainBtnText}>Secure Check In</Text></>}
                 </TouchableOpacity>
              )}

              {isCheckedIn && !isCheckedOut && (
                 <TouchableOpacity 
                   style={[styles.mainBtn, { backgroundColor: colors.error }, geoStatus !== 'valid' && styles.disabledBtn]} 
                   onPress={() => handleAction('checkout')}
                   disabled={geoStatus !== 'valid' || actionLoading}
                 >
                   {actionLoading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="log-out" size={24} color="#fff" /><Text style={styles.mainBtnText}>Check Out</Text></>}
                 </TouchableOpacity>
              )}
           </View>
        </AppCard>

        {/* History Link */}
        <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('AttendanceHistory')}>
           <View style={styles.historyIcon}>
              <Ionicons name="calendar" size={24} color="#fff" />
           </View>
           <View style={styles.historyInfo}>
              <Text style={styles.historyTitle}>Attendance History</Text>
              <Text style={styles.historySub}>View monthly logs & corrections</Text>
           </View>
           <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Today's Data */}
        <AppCard style={styles.todayDataCard}>
           <Text style={styles.sectionTitle}>Today's Metrics</Text>
           <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>In Time</Text>
              <Text style={[styles.metricValue, { color: colors.success }]}>
                {todayRecord?.inTime ? new Date(todayRecord.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
           </View>
           <View style={styles.metricDivider} />
           <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Out Time</Text>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {todayRecord?.outTime ? new Date(todayRecord.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
           </View>
           <View style={styles.metricDivider} />
           <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Hours</Text>
              <Text style={styles.metricValue}>
                {todayRecord?.totalHours ? todayRecord.totalHours.toFixed(1) + 'h' : '--'}
              </Text>
           </View>
           {todayRecord?.isLate && (
             <View style={styles.lateBadge}>
                <Ionicons name="alert-circle" size={16} color={colors.warning} />
                <Text style={styles.lateBadgeText}>Late by {todayRecord.lateMinutes} mins</Text>
             </View>
           )}
        </AppCard>

      </ScrollView>

      {/* Face Verification Modal */}
      <FaceVerificationModal 
        visible={faceModalVisible}
        onClose={() => setFaceModalVisible(false)}
        onCapture={onFaceCaptured}
        title={faceOp === 'checkin' ? 'Identity Check-In' : 'Identity Check-Out'}
      />

      {/* Checkout Report Modal */}
      <Modal 
        isVisible={showReportModal}
        style={styles.modal}
        onBackdropPress={() => setShowReportModal(false)}
        propagateSwipe
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Check-out Report</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.reportLabel}>Today's Completed Work *</Text>
              <TextInput 
                style={[styles.reportInput, { height: 80 }]}
                placeholder="What did you achieve today?"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={reportForm.todayWork}
                onChangeText={t => setReportForm({...reportForm, todayWork: t})}
              />

              <Text style={styles.reportLabel}>Pending / Carry-over Tasks</Text>
              <TextInput 
                style={[styles.reportInput, { height: 60 }]}
                placeholder="Tasks for tomorrow..."
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                value={reportForm.pendingWork}
                onChangeText={t => setReportForm({...reportForm, pendingWork: t})}
              />

              <Text style={styles.reportLabel}>Issues / Blockers</Text>
              <TextInput 
                style={[styles.reportInput, { height: 60 }]}
                placeholder="Any challenges faced?"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                value={reportForm.issuesFaced}
                onChangeText={t => setReportForm({...reportForm, issuesFaced: t})}
              />

              <Text style={styles.reportLabel}>Share Report With</Text>
              <View style={styles.participantsContainer}>
                {managementEmps.map(emp => {
                  const selected = reportForm.reportParticipants.includes(emp._id);
                  return (
                    <TouchableOpacity 
                      key={emp._id}
                      onPress={() => toggleParticipant(emp._id)}
                      style={[styles.participantPill, selected && styles.selectedPill]}
                    >
                      <Text style={[styles.participantText, selected && { color: '#fff' }]}>{emp.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, actionLoading && styles.disabledBtn]} 
                onPress={proceedCheckOut}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit & Check Out</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  dateText: { fontSize: 14, color: colors.textTertiary, fontWeight: '600', marginTop: 4 },
  refreshIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  
  statusSection: { marginBottom: 16 },
  geoPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  geoText: { fontSize: 12, fontWeight: '800' },

  actionCard: { 
    height: 380, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    backgroundColor: '#0F172A', // Dark theme matching web
    borderRadius: 32,
    padding: 30
  },
  activeSession: { alignItems: 'center' },
  timerLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 12 },
  timerText: { fontSize: 56, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  inTimeSub: { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 12 },

  idleSession: { alignItems: 'center' },
  idleCircle: { width: 80, height: 80, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  idleTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
  idleSub: { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 200 },

  doneSession: { alignItems: 'center' },
  doneCircle: { marginBottom: 20 },
  doneTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
  doneSub: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },

  actions: { width: '100%', marginTop: 40 },
  mainBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  disabledBtn: { opacity: 0.5 },

  historyBtn: { backgroundColor: colors.surface, padding: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  historyIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  historyInfo: { flex: 1, marginLeft: 16 },
  historyTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  historySub: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },

  todayDataCard: { padding: 20, borderRadius: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 16 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  metricLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  metricValue: { fontSize: 15, fontWeight: '800' },
  metricDivider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  lateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.warning + '15', padding: 12, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: colors.warning + '30' },
  lateBadgeText: { fontSize: 13, color: colors.warning, fontWeight: '700' },

  // Modal styles
  modal: { margin: 0, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  reportLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, marginTop: 16 },
  reportInput: { backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 16, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border },
  participantsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  participantPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  selectedPill: { backgroundColor: colors.primary, borderColor: colors.primary },
  participantText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  submitBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 32, marginBottom: 20 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});

export default AttendanceScreen;
