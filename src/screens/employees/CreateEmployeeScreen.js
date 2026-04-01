import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { createEmployee } from '../../api/employee.api';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import Toast from 'react-native-toast-message';
import { roles } from '../../constants/roles';

const CreateEmployeeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeCode: '',
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'Employee',
    department: '',
    position: '',
    status: 'Active'
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    // Basic validation
    if (!formData.employeeCode || !formData.name || !formData.email || !formData.password) {
      Toast.show({ type: 'error', text1: 'Required Fields', text2: 'Please fill name, email, code and password.' });
      return;
    }

    try {
      setLoading(true);
      await createEmployee(formData);
      Toast.show({ type: 'success', text1: 'Employee Created', text2: `${formData.name} added successfully.` });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Creation Failed', text2: err?.response?.data?.message || 'Error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Add Employee" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Login Credentials</Text>
          <AppInput
            label="Employee Code (e.g. IA00001)"
            value={formData.employeeCode}
            onChangeText={(v) => handleChange('employeeCode', v)}
            placeholder="IAxxxxx"
            autoCapitalize="characters"
          />
          <AppInput
            label="Password"
            value={formData.password}
            onChangeText={(v) => handleChange('password', v)}
            placeholder="Min 6 characters"
            secureTextEntry
          />

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Personal Details</Text>
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

          <AppButton
            title="Create Employee"
            onPress={handleCreate}
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

export default CreateEmployeeScreen;
