import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/backendUrl';
const LoginScreen = ({ navigation }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      console.log('Please enter both email/username and password');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/project-0/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailOrUsername,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userId', data.data._id);
        console.log('AsyncStorage token saved:', data.token);
        console.log('AsyncStorage userId saved:', data.data._id);
        navigation.navigate('DrawerNavigator');
      } else {
        console.log('Login failed:', data.message || 'Server error');
      }
    } catch (error) {
      console.error('Network or parsing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.headerSection}>
              <Text style={styles.mainHeading}>Let's Sign you in.</Text>
              <Text style={styles.welcomeText}>
                Managed your tasks easily and with simple
              </Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email / Username</Text>
                <View style={styles.inputBox}>
                  <Mail size={22} color="#F2F0EF" style={styles.leftIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email or username"
                    placeholderTextColor="#F2F0EF"
                    value={emailOrUsername}
                    onChangeText={setEmailOrUsername}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputBox}>
                  <Lock size={22} color="#F2F0EF" style={styles.leftIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#F2F0EF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.rightIconArea}
                    hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                  >
                    {showPassword ? (
                      <Eye size={22} color="#F2F0EF" />
                    ) : (
                      <EyeOff size={22} color="#F2F0EF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              {isLoading ? (
                <View style={styles.loginButton}>
                  <ActivityIndicator size="large" color="#66615E" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.loginButton}
                  activeOpacity={0.9}
                  onPress={handleLogin}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Register */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterScreen')}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F0EF' },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingTop: height * 0.08,
    paddingBottom: height * 0.05,
  },
  subText2: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  content: { flex: 1, justifyContent: 'center' },
  headerSection: {
    alignItems: 'center',
    paddingBottom: height * 0.04,
    marginTop: height * 0.05,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: height * 0.02,
  },
  mainHeading: {
    fontSize: Math.min(32, width * 0.08),
    fontWeight: 'bold',
    color: '#363f5f',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: Math.min(22, width * 0.06),
    color: '#535e79',
    textAlign: 'center',
  },
  inputContainer: { marginBottom: height * 0.02 },
  label: {
    fontSize: Math.min(16, width * 0.04),
    color: '#363f5f',
    marginBottom: height * 0.01,
    fontWeight: '500',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363f5f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#200025',
    paddingHorizontal: Math.max(12, width * 0.03),
    height: Math.max(52, height * 0.06),
  },
  input: {
    flex: 1,
    color: '#fbfaf4',
    marginLeft: 8,
    marginRight: 8,
    paddingVertical: 0,
    fontSize: Math.min(16, width * 0.04),
  },
  leftIcon: { marginRight: 2 },
  rightIconArea: { marginLeft: 2 },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.04,
    paddingBottom: height * 0.03,
    marginTop: 'auto',
  },
  registerText: { fontSize: Math.min(16, width * 0.04), color: '#535e79' },
  registerLink: {
    fontSize: Math.min(16, width * 0.04),
    color: '#363f5f',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#363f5f',
    borderRadius: 12,
    padding: Math.max(16, height * 0.02),
    alignItems: 'center',
    marginTop: height * 0.02,
    justifyContent: 'center',
    height: Math.max(45, height * 0.07),
    borderColor: '#66615E',
    borderWidth: 1,
  },
  loginButtonText: {
    color: '#F2F0EF',
    fontSize: Math.min(18, width * 0.045),
    fontWeight: '600',
  },
});
