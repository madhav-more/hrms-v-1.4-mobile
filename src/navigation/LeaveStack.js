import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyLeavesScreen from '../screens/leaves/MyLeavesScreen';
import ApplyLeaveScreen from '../screens/leaves/ApplyLeaveScreen';
import LeaveApprovalScreen from '../screens/leaves/LeaveApprovalScreen';
import LeaveDashboardScreen from '../screens/leaves/LeaveDashboardScreen';
import { useAuth } from '../hooks/useAuth';
import { isManagement } from '../utils/roleUtils';

const Stack = createNativeStackNavigator();

const LeaveStack = () => {
  const { user } = useAuth();
  const isAdmin = isManagement(user?.role);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyLeaves" component={MyLeavesScreen} />
      <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} />
      {isAdmin && (
        <>
          <Stack.Screen name="LeaveApproval" component={LeaveApprovalScreen} />
          <Stack.Screen name="LeaveDashboard" component={LeaveDashboardScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default LeaveStack;
