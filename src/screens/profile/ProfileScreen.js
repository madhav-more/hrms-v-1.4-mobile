import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, roleColors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import Avatar from '../../components/common/Avatar';
import { formatDate } from '../../utils/dateUtils';
import Toast from 'react-native-toast-message';
import FaceVerificationModal from '../../components/common/FaceVerificationModal';
import { registerFace } from '../../api/employee.api';

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={16} color={colors.textSecondary} style={styles.infoIcon} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshProfile } = useAuth();
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const roleStyle = roleColors[user?.role] || roleColors.Employee;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Toast.show({ type: 'info', text1: 'Logged out' });
          }
        }
      ]
    );
  };

  const onFaceCaptured = async (base64Image) => {
    setIsRegistering(true);
    setFaceModalVisible(false);
    try {
      await registerFace({ faceImage: base64Image });
      Toast.show({ type: 'success', text1: 'Face ID Registered', text2: 'You can now use face verification for attendance' });
      await refreshProfile();
    } catch (error) {
      Toast.show({ 
        type: 'error', 
        text1: 'Registration Failed', 
        text2: error?.response?.data?.message || 'Error occurred' 
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="My Profile" showBack={false} />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Hero */}
        <AppCard style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Avatar url={user?.profileImageUrl} name={user?.name} size={72} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{user?.name}</Text>
              <Text style={styles.heroPosition}>{user?.position}</Text>
              <View style={[styles.rolePill, { backgroundColor: roleStyle.bg }]}>
                <Text style={[styles.rolePillText, { color: roleStyle.text }]}>{user?.role}</Text>
              </View>
            </View>
          </View>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>{user?.employeeCode}</Text>
            <Text style={styles.deptLabel}>{user?.department}</Text>
          </View>
        </AppCard>

        {/* Contact Info */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <InfoItem icon="mail-outline" label="Email" value={user?.email} />
          <InfoItem icon="call-outline" label="Mobile" value={user?.mobileNumber} />
        </AppCard>

        {/* Security / Face ID */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <AppButton
            title={user?.faceDescriptor?.length > 0 ? "Update Face ID" : "Register Face ID"}
            variant={user?.faceDescriptor?.length > 0 ? "outline" : "primary"}
            onPress={() => setFaceModalVisible(true)}
            loading={isRegistering}
            icon={<Ionicons name="scan-outline" size={16} color={user?.faceDescriptor?.length > 0 ? colors.primary : "#fff"} style={{ marginRight: 8 }} />}
            style={styles.actionBtn}
          />
          <AppButton
            title="Change Password"
            variant="outline"
            onPress={() => navigation.navigate('ChangePassword')}
            icon={<Ionicons name="key-outline" size={16} color={colors.primary} style={{ marginRight: 8 }} />}
            style={styles.actionBtn}
          />
        </AppCard>

        {/* Danger Zone */}
        <AppButton
          title="Logout"
          onPress={handleLogout}
          style={styles.logoutBtn}
          icon={<Ionicons name="log-out-outline" size={18} color="#fff" style={{ marginRight: 8 }} />}
        />

      </ScrollView>

      <FaceVerificationModal
        visible={faceModalVisible}
        onClose={() => setFaceModalVisible(false)}
        onCapture={onFaceCaptured}
        title="Face ID Registration"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 12, paddingBottom: 32 },
  heroCard: { padding: 16, marginBottom: 12 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroInfo: { flex: 1, marginLeft: 16 },
  heroName: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  heroPosition: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  rolePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rolePillText: { fontSize: 12, fontWeight: '700' },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  codeLabel: { fontSize: 14, fontWeight: '700', color: colors.primary },
  deptLabel: { fontSize: 14, color: colors.textSecondary },
  section: { padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoIcon: { marginRight: 10, marginTop: 2 },
  infoLabel: { fontSize: 12, color: colors.textSecondary },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  actionBtn: { marginBottom: 8 },
  logoutBtn: { backgroundColor: colors.error, marginHorizontal: 0, marginTop: 4 },
});

export default ProfileScreen;
