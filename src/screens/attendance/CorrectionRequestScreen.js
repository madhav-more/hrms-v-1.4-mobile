import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { colors } from '../../constants/colors';
import { requestCorrection } from '../../api/attendance.api';
import AppHeader from '../../components/layout/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const CorrectionRequestScreen = ({ route, navigation }) => {
  const { record } = route.params;
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    requestedInTime: record.inTime ? new Date(record.inTime).toTimeString().slice(0, 5) : '09:30',
    requestedOutTime: record.outTime ? new Date(record.outTime).toTimeString().slice(0, 5) : '18:00',
    reason: '',
    proofUrl: ''
  });

  const handleSubmit = async () => {
    if (!form.reason.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please provide a reason' });
      return;
    }

    setLoading(true);
    try {
      const date = new Date(record.date).toISOString().split('T')[0];
      const payload = {
        reason: form.reason,
        requestedInTime: `${date}T${form.requestedInTime}:00`,
        requestedOutTime: `${date}T${form.requestedOutTime}:00`,
        proofUrl: form.proofUrl,
      };

      await requestCorrection(record._id, payload);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Correction request submitted' });
      navigation.goBack();
    } catch (error) {
      console.error('Correction error:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Failed', 
        text2: error.response?.data?.message || 'Could not submit request' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Request Correction</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
             <Text style={styles.infoLabel}>Correction for Date</Text>
             <Text style={styles.infoValue}>
               {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
             </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Requested In-Time</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="time-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={styles.input}
                value={form.requestedInTime}
                onChangeText={(val) => setForm({...form, requestedInTime: val})}
                placeholder="HH:MM (24h)"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Requested Out-Time</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="time-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={styles.input}
                value={form.requestedOutTime}
                onChangeText={(val) => setForm({...form, requestedOutTime: val})}
                placeholder="HH:MM (24h)"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reason *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.reason}
              onChangeText={(val) => setForm({...form, reason: val})}
              placeholder="Provide a valid reason for correction..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Supporting Proof (Link)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="link" size={20} color={colors.textTertiary} />
              <TextInput
                style={styles.input}
                value={form.proofUrl}
                onChangeText={(val) => setForm({...form, proofUrl: val})}
                placeholder="Link to document or image"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: colors.surface, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border,
    gap: 12
  },
  title: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  scrollContent: { padding: 20 },
  infoCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  infoLabel: { fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52
  },
  input: { flex: 1, fontSize: 14, color: colors.text, paddingLeft: 12 },
  textArea: { height: 100, paddingTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16 },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledBtn: { backgroundColor: colors.textTertiary, shadowOpacity: 0 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default CorrectionRequestScreen;
