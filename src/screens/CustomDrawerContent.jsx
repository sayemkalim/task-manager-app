import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export function CustomDrawerContent() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const handleSelectCompany = company => {
    const payload = { id: company._id, name: company.name };
    navigation.navigate('HomeStack', {
      screen: 'Home',
      params: { selectedCompany: payload, _ts: Date.now() },
    });

    navigation.closeDrawer();
  };
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.error('No userId found in AsyncStorage');
          setIsLoading(false);
          return;
        }
        const response = await fetch(
          `https://signature-backend-bm3q.onrender.com/api/project-0/company/${userId}`,
        );
        const result = await response.json();
        setCompanies(result.data); // <-- This is the key fix
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const getInitials = name => (name ? name.charAt(0).toUpperCase() : '');

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <Text style={styles.workspacesTitle}>Companies</Text>
      <View>
        {isLoading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#615656" />
          </View>
        ) : companies.length > 0 ? (
          companies.map((company, index) => (
            <TouchableOpacity
              key={company._id}
              style={[
                styles.workspaceItem,
                index < companies.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                  marginBottom: 8,
                },
              ]}
              activeOpacity={1}
              onPress={() => handleSelectCompany(company)}
            >
              <View style={styles.workspaceIcon}>
                <Text
                  style={{ fontWeight: 'bold', fontSize: 20, color: '#615656' }}
                >
                  {getInitials(company.name)}
                </Text>
              </View>
              <View style={styles.workspaceInfo}>
                <Text style={{ fontWeight: 'bold', color: '#615656' }}>
                  {company.name}
                </Text>
                <Text style={{ color: '#8b8481' }}>{company.description}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: 'center', padding: 20, color: '#615656' }}>
            No Companies found
          </Text>
        )}
      </View>
      <View style={styles.bottomDrawerMenu}>
        <TouchableOpacity activeOpacity={1} style={styles.drawerMenuItem}>
          <Text>+ Add a Company</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#F2F0EF',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  workspacesContainer: {
    marginBottom: 20,
    borderColor: '#66615E',
    borderWidth: 0.4,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  workspacesTitle: {
    color: '#615656',
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
    marginHorizontal: 4,
    marginTop: 4,
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
  bottomDrawerMenu: {
    marginTop: 'auto',
  },
  drawerMenuItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: '#615656',
  },
});
