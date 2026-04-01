import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { colors } from '../../constants/colors';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import { applyLeave } from '../../api/leave.api';
import Toast from 'react-native-toast-message';

// Note: For a real app, use a date picker library like @react-native-community/datetimepicker
// Here we'll use a simple YYYY-MM-DD text input for simplicity.

const ApplyLeaveScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Casual', // Hardcoded options could be handled via picker
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    isHalfDay: false,
  });

  const handleSubmit = async () => {
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all required fields.' });
      return;
    }

    try {
      setLoading(true);
      await applyLeave(formData);
      Toast.show({ type: 'success', text1: 'Leave Applied Successfully' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to Apply', text2: err?.response?.data?.message || 'Error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Apply Leave" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.card}>
          <AppInput
            label="Leave Type (e.g. Casual, Sick, Earned)"
            value={formData.leaveType}
            onChangeText={(text) => setFormData({ ...formData, leaveType: text })}
          />
          
          <AppInput
            label="Start Date (YYYY-MM-DD)"
            value={formData.startDate}
            onChangeText={(text) => setFormData({ ...formData, startDate: text })}
          />
          
          <AppInput
            label="End Date (YYYY-MM-DD)"
            value={formData.endDate}
            onChangeText={(text) => setFormData({ ...formData, endDate: text })}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Half Day</Text>
            <Switch
              value={formData.isHalfDay}
              onValueChange={(val) => setFormData({ ...formData, isHalfDay: val })}
              trackColor={{ false: colors.borderDark, true: colors.primaryLight }}
              thumbColor={formData.isHalfDay ? colors.primary : colors.surfaceAlt}
            />
          </View>

          <AppInput
            label="Reason"
            value={formData.reason}
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <AppButton 
            title="Submit Leave Request" 
            onPress={handleSubmit} 
            loading={loading}
            style={styles.submitBtn} 
          />
        </AppCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  card: { padding: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  switchLabel: { fontSize: 16, fontWeight: '500', color: colors.text },
  textArea: { height: 100 },
  submitBtn: { marginTop: 16 }
});

export default ApplyLeaveScreen;
