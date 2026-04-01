import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { changePassword } from '../../api/auth.api';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import Toast from 'react-native-toast-message';

const ChangePasswordScreen = ({ navigation }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      Toast.show({ type: 'error', text1: 'All fields are required.' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match.' });
      return;
    }
    if (form.newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      setLoading(true);
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      Toast.show({ type: 'success', text1: 'Password Changed Successfully' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Change Password" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.card}>
          <Text style={styles.note}>Enter your current password and choose a new one (minimum 6 characters).</Text>
          <AppInput
            label="Current Password"
            value={form.currentPassword}
            onChangeText={(t) => setForm({ ...form, currentPassword: t })}
            secureTextEntry
            placeholder="Enter current password"
          />
          <AppInput
            label="New Password"
            value={form.newPassword}
            onChangeText={(t) => setForm({ ...form, newPassword: t })}
            secureTextEntry
            placeholder="Enter new password"
          />
          <AppInput
            label="Confirm New Password"
            value={form.confirmPassword}
            onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
            secureTextEntry
            placeholder="Re-enter new password"
          />
          <AppButton title="Update Password" onPress={handleSubmit} loading={loading} style={styles.btn} />
        </AppCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  card: { padding: 16 },
  note: { fontSize: 13, color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  btn: { marginTop: 8 },
});

export default ChangePasswordScreen;
