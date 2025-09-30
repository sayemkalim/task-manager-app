import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { ArrowLeft, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user ID from AsyncStorage then call API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          Alert.alert('Error', 'User ID not found in storage.');
          setLoading(false);
          return;
        }
        const response = await fetch(
          `https://signature-backend-bm3q.onrender.com/api/project-0/auth/users/${userId}`,
        );
        const json = await response.json();
        if (json.user) {
          setUserData(json.user);
        } else {
          Alert.alert('Error', 'User data not found in response.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Logout function: clear AsyncStorage and reset navigation
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={25} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </View>

      {userData && (
        <View style={styles.card}>
          <Text style={styles.name}>{userData.fullName}</Text>
          <Text style={styles.email}>{userData.email}</Text>

          {/* <Text style={styles.companiesTitle}>Companies:</Text>
          <ScrollView style={styles.companiesList}>
            {userData.companies.map(company => (
              <View key={company.companyId} style={styles.companyItem}>
                <Text style={styles.companyName}>{company.name}</Text>
                <Text style={styles.companyDesc}>{company.description}</Text>
                <Text style={styles.companyRole}>Role: {company.role}</Text>
              </View>
            ))}
          </ScrollView> */}
        </View>
      )}

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={24} color="#ff3c00" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'ios' ? 60 : 0,
  },
  headerWrapper: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backButton: {
    paddingRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 14,
  },
  companiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  companiesList: {
    maxHeight: 200,
  },
  companyItem: {
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  companyName: {
    fontWeight: '700',
    fontSize: 16,
  },
  companyDesc: {
    fontSize: 14,
    color: '#555',
  },
  companyRole: {
    fontSize: 13,
    color: '#888',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3c00',
    padding: 12,
    marginHorizontal: 30,
    marginVertical: 20,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 10,
    color: '#ff3c00',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;
