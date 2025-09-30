import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import {
  Home,
  ClipboardList,
  User,
  CheckSquare,
  Menu,
} from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import { CustomDrawerContent } from '../screens/CustomDrawerContent';
import MyTaskScreen from '../screens/MyTaskScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function CustomDrawerToggle({ navigation, name }) {
  const initial = name?.[0]?.toUpperCase();

  return (
    <View
      style={{ marginLeft: 16, flexDirection: 'row', alignItems: 'center' }}
    >
      <TouchableOpacity
        onPress={() => navigation.openDrawer()}
        activeOpacity={0.8}
      >
        <Menu size={24} color="#fff" />
      </TouchableOpacity>

      <View
        style={{
          marginLeft: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: '#E6E1E1',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#3F0E40', fontWeight: '700', fontSize: 17 }}>
            {initial}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: '#fff',
            marginLeft: 8,
            fontWeight: '600',
            fontSize: 18,
            maxWidth: 180,
          }}
        >
          {name || 'Select Company'}
        </Text>
      </View>
    </View>
  );
}
function HomeStack() {
  return (
    <Drawer.Navigator
      drawerContent={() => <CustomDrawerContent />}
      screenOptions={({ navigation, route }) => {
        const child = route?.state?.routes?.[route.state.index] ?? null;
        const params = child?.params ?? route?.params ?? {};
        const companyName = params?.selectedCompany?.name;

        return {
          headerTitle: '',
          headerLeft: () => (
            <CustomDrawerToggle navigation={navigation} name={companyName} />
          ),
          headerStyle: { backgroundColor: '#363f5f' },
          drawerType: 'front',
        };
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

export default function BottomNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomeStack') {
            return <Home color={color} size={size} strokeWidth={2} />;
          } else if (route.name === 'All Tasks') {
            return <ClipboardList color={color} size={size} strokeWidth={2} />;
          } else if (route.name === 'Profile') {
            return <User color={color} size={size} strokeWidth={2} />;
          } else if (route.name === 'My Tasks') {
            return <CheckSquare color={color} size={size} strokeWidth={2} />;
          }
        },
        tabBarActiveTintColor: '#363f5f',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#F2F0EF',
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarHideOnKeyboard: true,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="All Tasks"
        component={() => (
          <View style={styles.center}>
            <Text>All Tasks</Text>
          </View>
        )}
      />
      <Tab.Screen name="My Tasks" component={MyTaskScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#3F0E40',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  workspacesContainer: {
    marginBottom: 20,
  },
  workspacesTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  workspaceIcon: {
    backgroundColor: '#ddd',
    borderRadius: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspaceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  workspaceMore: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingHorizontal: 10,
  },
  bottomDrawerMenu: {
    marginTop: 'auto',
    marginBottom: 25,
  },
  drawerMenuItem: {
    paddingVertical: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
