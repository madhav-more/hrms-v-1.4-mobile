import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const TabBarIcon = ({ routeName, focused, color, size }) => {
  let iconName;

  switch (routeName) {
    case 'DashboardTab':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'AttendanceTab':
      iconName = focused ? 'calendar' : 'calendar-outline';
      break;
    case 'LeavesTab':
      iconName = focused ? 'time' : 'time-outline';
      break;
    case 'TeamTab': // For HR/Admins
      iconName = focused ? 'people' : 'people-outline';
      break;
    case 'MenuTab':
      iconName = focused ? 'grid' : 'grid-outline';
      break;
    default:
      iconName = 'help-circle-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

export default TabBarIcon;
