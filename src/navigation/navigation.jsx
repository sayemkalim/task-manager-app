import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../authNavigation/LoginScreen';
import RegisterScreen from '../authNavigation/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';
import CreateProjectScreen from '../screens/CreateProjectScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import MyTaskScreen from '../screens/MyTaskScreen';
import ProfileScreen from '../screens/ProfileScreen';

import DrawerNavigator from '../navigation/DraweNavigator';
const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          screenOptions={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          screenOptions={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          screenOptions={{ headerShown: false }}
        />
        <Stack.Screen
          name="DrawerNavigator"
          component={DrawerNavigator}
          screenOptions={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateProjectScreen"
          component={CreateProjectScreen}
          screenOptions={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProjectDetailsScreen"
          component={ProjectDetailsScreen}
          screenOptions={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateTaskScreen"
          component={CreateTaskScreen}
          screenOptions={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyTaskScreen"
          component={MyTaskScreen}
          screenOptions={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          screenOptions={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
