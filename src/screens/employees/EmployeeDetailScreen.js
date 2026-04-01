import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, roleColors } from '../../constants/colors';
import { useFetch } from '../../hooks/useFetch';
import { getEmployeeById } from '../../api/employee.api';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../hooks/useAuth';
import { isManagement } from '../../utils/roleUtils';

const InfoRow = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    {icon && <Ionicons name={icon} size={16} color={colors.textSecondary} style={styles.infoIcon} />}
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const EmployeeDetailScreen = ({ route, navigation }) => {
  const { employeeId } = route.params;
  const { data: employee, loading } = useFetch(() => getEmployeeById(employeeId), null);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!employee) return (
    <View style={styles.container}>
      <PageHeader title="Employee" showBack onBack={() => navigation.goBack()} />
      <Text style={styles.errorText}>Employee not found.</Text>
    </View>
  );

  const roleColor = roleColors[employee.role] || roleColors.Employee;

  const { user } = useAuth();
  const isAdmin = isManagement(user?.role);

  return (
    <View style={styles.container}>
      <PageHeader 
        title="Employee Profile" 
        showBack 
        onBack={() => navigation.goBack()}
        rightAction={isAdmin ? () => navigation.navigate('EditEmployee', { employeeId }) : null}
        rightActionIcon="create-outline"
      />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Hero Card */}
        <AppCard style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Avatar url={employee.profileImageUrl} name={employee.name} size={72} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{employee.name}</Text>
              <Text style={styles.heroPosition}>{employee.position}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleColor.bg }]}>
                <Text style={[styles.roleText, { color: roleColor.text }]}>{employee.role}</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroFooter}>
            <Text style={styles.empCode}>{employee.employeeCode}</Text>
            <StatusBadge status={employee.status} />
          </View>
        </AppCard>

        {/* Work Info */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Work Information</Text>
          <InfoRow icon="business-outline" label="Department" value={employee.department} />
          <InfoRow icon="briefcase-outline" label="Position" value={employee.position} />
          <InfoRow icon="calendar-outline" label="Date of Joining" value={formatDate(employee.dateOfJoining)} />
          <InfoRow icon="person-outline" label="Employment Type" value={employee.employmentType} />
        </AppCard>

        {/* Personal Info */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow icon="mail-outline" label="Email" value={employee.email} />
          <InfoRow icon="call-outline" label="Mobile" value={employee.mobileNumber} />
          <InfoRow icon="water-outline" label="Blood Group" value={employee.bloodGroup} />
          <InfoRow icon="home-outline" label="Current Address" value={employee.currentAddress} />
        </AppCard>

        {/* Emergency Contact */}
        {employee.emergencyContactName && (
          <AppCard style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <InfoRow icon="person-circle-outline" label="Name" value={employee.emergencyContactName} />
            <InfoRow icon="call-outline" label="Mobile" value={employee.emergencyContactMobile} />
          </AppCard>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 12 },
  heroCard: { padding: 16, marginBottom: 12 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroInfo: { flex: 1, marginLeft: 16 },
  heroName: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  heroPosition: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: 12, fontWeight: '700' },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  empCode: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  section: { padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoIcon: { marginRight: 8, marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: colors.textSecondary },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '500', marginTop: 2 },
  errorText: { textAlign: 'center', marginTop: 40, color: colors.textSecondary, fontSize: 16 },
});

export default EmployeeDetailScreen;
