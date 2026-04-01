import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { colors } from '../../constants/colors';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
  const { login } = useAuth();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!employeeCode || !password) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please enter employee code and password' });
      return;
    }

    try {
      setLoading(true);
      await login({ employeeCode, password });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error?.response?.data?.message || 'Invalid credentials'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
             <View style={styles.iconContainer}>
               <Ionicons name="business" size={48} color={colors.primary} />
             </View>
             <Text style={styles.title}>Welcome Back</Text>
             <Text style={styles.subtitle}>Sign in to your HRMS account</Text>
          </View>

          <View style={styles.formContainer}>
            <AppInput
              label="Employee Code"
              placeholder="e.g. EMP001"
              value={employeeCode}
              onChangeText={setEmployeeCode}
              icon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
              autoCapitalize="characters"
            />
            
            <AppInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            />

            <View style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </View>

            <AppButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
              size="large"
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
  }
});

export default LoginScreen;
