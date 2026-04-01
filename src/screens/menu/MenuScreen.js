import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layout/AppHeader';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/common/Avatar';
import { isManagement } from '../../utils/roleUtils';

const MenuItem = ({ icon, label, onPress, color = colors.text, badge }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.menuItemLabel, { color }]}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </View>
  </TouchableOpacity>
);

const MenuScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const isAdmin = isManagement(user?.role);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Profile Card Summary */}
        <TouchableOpacity 
          style={styles.profileSummary}
          onPress={() => navigation.navigate('Profile')}
        >
          <Avatar url={user?.profileImageUrl} name={user?.name} size={60} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileMeta}>{user?.employeeCode} • {user?.position}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <MenuItem 
            icon="megaphone-outline" 
            label="Announcements" 
            onPress={() => navigation.navigate('Announcements')}
            color={colors.primary}
          />
          <MenuItem 
            icon="calendar-outline" 
            label="Holidays" 
            onPress={() => navigation.navigate('Holidays')}
            color={colors.warning}
          />
          <MenuItem 
            icon="school-outline" 
            label="Gurukul (Learning)" 
            onPress={() => navigation.navigate('Gurukul')}
            color={colors.accent}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work</Text>
          <MenuItem 
            icon="receipt-outline" 
            label={isAdmin ? "Payroll Management" : "My Pay Slips"} 
            onPress={() => navigation.navigate('Payroll')}
            color={colors.success}
          />
          {isAdmin && (
            <MenuItem 
              icon="stats-chart-outline" 
              label="Leave Reports" 
              onPress={() => navigation.navigate('LeavesTab', { screen: 'LeaveDashboard' })}
              color={colors.info}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Privacy</Text>
          <MenuItem 
            icon="person-outline" 
            label="Profile Settings" 
            onPress={() => navigation.navigate('Profile')}
          />
          <MenuItem 
            icon="lock-closed-outline" 
            label="Change Password" 
            onPress={() => navigation.navigate('Profile', { screen: 'ChangePassword' })}
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>HRMS Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  profileMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemLabel: { fontSize: 15, fontWeight: '500' },
  menuItemRight: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
  },
  versionText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 16,
  }
});

export default MenuScreen;
