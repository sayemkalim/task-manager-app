import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          navigation.replace('DrawerNavigator');
        } else {
          navigation.replace('LoginScreen');
        }
      } catch (error) {
        console.error('Error reading token:', error);
        navigation.replace('LoginScreen');
      } finally {
        setLoading(false);
      }
    };

    checkUserToken();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        {/* <ActivityIndicator size="large" color="#000" />
         */}
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default SplashScreen;
