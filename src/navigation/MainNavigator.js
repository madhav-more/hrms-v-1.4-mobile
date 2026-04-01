import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBarIcon from '../components/layout/TabBarIcon';
import { colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { isManagement } from '../utils/roleUtils';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AttendanceStack from './AttendanceStack';
import LeaveStack from './LeaveStack';
import EmployeeStack from './EmployeeStack';
import MenuStack from './MenuStack';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const { user } = useAuth();
  const showTeamTab = isManagement(user?.role);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon routeName={route.name} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{ title: 'Home' }} 
      />
      <Tab.Screen 
        name="AttendanceTab" 
        component={AttendanceStack} 
        options={{ title: 'Attendance' }} 
      />
      <Tab.Screen 
        name="LeavesTab" 
        component={LeaveStack} 
        options={{ title: 'Leaves' }} 
      />
      
      {showTeamTab && (
        <Tab.Screen 
          name="TeamTab" 
          component={EmployeeStack} 
          options={{ title: 'Team' }} 
        />
      )}
      
      <Tab.Screen 
        name="MenuTab" 
        component={MenuStack} 
        options={{ title: 'More' }} 
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
