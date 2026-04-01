import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeeListScreen from '../screens/employees/EmployeeListScreen';
import EmployeeDetailScreen from '../screens/employees/EmployeeDetailScreen';
import CreateEmployeeScreen from '../screens/employees/CreateEmployeeScreen';
import EditEmployeeScreen from '../screens/employees/EditEmployeeScreen';

const Stack = createNativeStackNavigator();

const EmployeeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
      <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
      <Stack.Screen name="CreateEmployee" component={CreateEmployeeScreen} />
      <Stack.Screen name="EditEmployee" component={EditEmployeeScreen} />
    </Stack.Navigator>
  );
};

export default EmployeeStack;
