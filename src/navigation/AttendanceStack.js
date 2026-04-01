import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import AdminAttendance from '../screens/attendance/AdminAttendance';
import CorrectionApproval from '../screens/attendance/CorrectionApproval';
import AttendanceHistoryScreen from '../screens/attendance/AttendanceHistoryScreen';
import CorrectionRequestScreen from '../screens/attendance/CorrectionRequestScreen';
import { useAuth } from '../hooks/useAuth';
import { isManagement } from '../utils/roleUtils';

const Stack = createNativeStackNavigator();

const AttendanceStack = () => {
  const { user } = useAuth();
  const isAdmin = isManagement(user?.role);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AttendanceMain" component={AttendanceScreen} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
      <Stack.Screen name="CorrectionRequest" component={CorrectionRequestScreen} />
      {isAdmin && (
        <>
          <Stack.Screen name="AdminAttendance" component={AdminAttendance} />
          <Stack.Screen name="CorrectionApproval" component={CorrectionApproval} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AttendanceStack;
