import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { getEmployeeById, updateEmployee } from '../../api/employee.api';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from 'react-native-toast-message';

const EditEmployeeScreen = ({ route, navigation }) => {
  const { employeeId } = route.params;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    role: '',
    department: '',
    position: '',
    status: ''
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await getEmployeeById(employeeId);
        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            mobileNumber: data.mobileNumber || '',
            role: data.role || '',
            department: data.department || '',
            position: data.position || '',
            status: data.status || 'Active'
          });
        }
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Fetch Failed', text2: 'Error loading employee details' });
        navigation.goBack();
      } finally {
        setFetching(false);
      }
    };
    fetchEmployee();
  }, [employeeId, navigation]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.email) {
      Toast.show({ type: 'error', text1: 'Required Fields', text2: 'Name and email are required.' });
      return;
    }

    try {
      setLoading(true);
      await updateEmployee(employeeId, formData);
      Toast.show({ type: 'success', text1: 'Profile Updated', text2: `${formData.name}'s profile and work info saved.` });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: err?.response?.data?.message || 'Error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <PageHeader title="Edit Employee" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <AppInput
            label="Full Name"
            value={formData.name}
            onChangeText={(v) => handleChange('name', v)}
            placeholder="John Doe"
          />
          <AppInput
            label="Email Address"
            value={formData.email}
            onChangeText={(v) => handleChange('email', v)}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Mobile Number"
            value={formData.mobileNumber}
            onChangeText={(v) => handleChange('mobileNumber', v)}
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
          />

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Work Details</Text>
          <AppInput
            label="Role (e.g. Employee, Manager, HR)"
            value={formData.role}
            onChangeText={(v) => handleChange('role', v)}
            placeholder="Employee"
          />
          <AppInput
            label="Department"
            value={formData.department}
            onChangeText={(v) => handleChange('department', v)}
            placeholder="Operations"
          />
          <AppInput
            label="Position"
            value={formData.position}
            onChangeText={(v) => handleChange('position', v)}
            placeholder="Sales Executive"
          />
          <AppInput
            label="Status"
            value={formData.status}
            onChangeText={(v) => handleChange('status', v)}
            placeholder="Active or Inactive"
          />

          <AppButton
            title="Update Details"
            onPress={handleUpdate}
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
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 12 },
  submitBtn: { marginTop: 16 }
});

export default EditEmployeeScreen;
