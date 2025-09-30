import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomNavigation from './BottomNavigation';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="HomeTabs">
      <Drawer.Screen
        name="HomeTabs"
        component={BottomNavigation}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}
