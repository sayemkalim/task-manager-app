import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, X, CheckCircle } from 'lucide-react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BACKEND_URL } from '../utils/backendUrl';

const CreateProjectScreen = ({ navigation, route }) => {
  const bottomSheetRef = useRef(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getUser = `${BACKEND_URL}/api/project-0/auth/users`;
  const CREATE_PROJECT_URL = `${BACKEND_URL}/api/project-0/project`;
  const snapPoints = ['50%'];

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const companyId = route.params?.companyId || '';

  const handleAddMemberPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleSheetChanges = useCallback(index => {
    setIsSheetOpen(index >= 0);
  }, []);

  const handleCloseSheet = () => {
    bottomSheetRef.current?.close();
  };

  const fetchUsers = useCallback(async () => {
    try {
      setUsersError(null);
      setLoading(true);
      const res = await fetch(getUser, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const normalized = Array.isArray(data?.users) ? data.users : [];
      const mapped = normalized.map(u => ({
        id: u._id,
        name: u.fullName || u.userName || u.email || 'User',
        email: u.email || '',
        role: u.role || 'user',
      }));
      setUsers(mapped);
    } catch (e) {
      setUsersError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSheetOpen && users.length === 0 && !loading) {
      fetchUsers();
    }
  }, [isSheetOpen, users.length, loading, fetchUsers]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchUsers();
    } finally {
      setRefreshing(false);
    }
  }, [fetchUsers]);

  const visibleMembers = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      u =>
        (u.name || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  const toggleSelect = member => {
    setSelectedMembers(prev =>
      prev.some(m => m.id === member.id)
        ? prev.filter(m => m.id !== member.id)
        : [...prev, member],
    );
  };

  const getInitial = name => {
    if (!name || typeof name !== 'string') return '?';
    const trimmed = name.trim();
    return trimmed.length ? trimmed[0].toUpperCase() : '?';
  };

  const colorPalette = [
    '#6C5CE7',
    '#E17055',
    '#00B894',
    '#0984E3',
    '#D63031',
    '#E84393',
    '#2ECC71',
  ];
  const getColorForId = id => {
    if (!id) return colorPalette[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
    }
    return colorPalette[Math.abs(hash) % colorPalette.length];
  };

  const getUserIdFromStorage = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId || '';
    } catch (e) {
      return '';
    }
  };

  const handleCreateProject = async () => {
    const userId = await getUserIdFromStorage();

    if (!projectName.trim()) {
      Alert.alert('Alert', 'Please enter a project name');
      return;
    }
    if (!companyId) {
      Alert.alert('Alert', 'CompanyId is required');
      return;
    }
    if (selectedMembers.length === 0) {
      Alert.alert('Alert', 'Please add at least one member');
      return;
    }
    if (!userId) {
      Alert.alert('Alert', 'UserId is required');
      return;
    }

    const payload = {
      projectName: projectName.trim(),
      projectDescription: projectDescription.trim(),
      companyId,
      members: selectedMembers.map(m => m.id),
      userId,
    };

    try {
      const res = await fetch(CREATE_PROJECT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to create project');
      }
    } catch (error) {
      Alert.alert('Error', 'Error creating project: ' + error.message);
    }
  };

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
            activeOpacity={1}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={25} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.screen}>
        <Text style={styles.label}>Project Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter project name"
          placeholderTextColor="#66615E"
          value={projectName}
          onChangeText={setProjectName}
        />

        <Text style={styles.label}>Add member</Text>
        <View style={styles.membersRow}>
          {selectedMembers.map(member => {
            const bg = getColorForId(member.id);
            const initial = getInitial(member.name);
            return (
              <View
                key={member.id}
                style={[styles.memberInitialBox, { backgroundColor: bg }]}
              >
                <Text style={styles.memberInitialText}>{initial}</Text>
              </View>
            );
          })}
          <TouchableOpacity
            style={styles.addLabelButton}
            onPress={handleAddMemberPress}
          >
            <Text style={styles.addMemberText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Project Description</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Add project description"
          placeholderTextColor="#66615E"
          multiline
          value={projectDescription}
          onChangeText={setProjectDescription}
        />

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProject}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onChange={handleSheetChanges}
        backgroundStyle={{
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: '#f2f0f0',
        }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={handleCloseSheet}>
              <X size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Add Members</Text>
            <View style={{ width: 28 }} />
          </View>

          <TextInput
            style={styles.sheetSearch}
            placeholder="Search"
            value={searchTerm}
            placeholderTextColor="#66615E"
            onChangeText={setSearchTerm}
          />

          {loading && users.length === 0 ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#3F0E40" />
              <Text style={styles.loaderText}>Loading users...</Text>
            </View>
          ) : usersError ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>
                Failed to load users: {usersError}
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchUsers}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.membersGrid}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#3F0E40"
                />
              }
              keyboardShouldPersistTaps="handled"
            >
              {visibleMembers.map(member => {
                const isSelected = selectedMembers.some(
                  m => m.id === member.id,
                );
                const bg = getColorForId(member.id);
                const initial = getInitial(member.name);
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.avatarWrapper,
                      isSelected && styles.avatarSelected,
                    ]}
                    onPress={() => toggleSelect(member)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[styles.initialAvatar, { backgroundColor: bg }]}
                    >
                      <Text style={styles.initialText}>{initial}</Text>
                    </View>
                    {isSelected && (
                      <CheckCircle
                        size={20}
                        color="#3F0E40"
                        style={styles.checkIcon}
                      />
                    )}
                    <Text style={styles.avatarName} numberOfLines={1}>
                      {member.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {visibleMembers.length === 0 && (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              )}
            </ScrollView>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const AVATAR_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 60 : 0,
  },
  headerWrapper: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: { paddingRight: 15 },
  screen: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  label: {
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 16,
    color: '#43403e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#363f5f',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 30,
    color: '#000',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  memberInitialBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitialText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  addLabelButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#363f5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMemberText: {
    fontSize: 30,
    fontWeight: '700',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#66615E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 30,
    color: '#000',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#363f5f',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  sheetContent: {
    flex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#43403e',
  },
  sheetSearch: {
    backgroundColor: '#f1f0f0',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    borderColor: '#b2aaa5',
    borderWidth: 1,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 8,
  },
  avatarWrapper: {
    alignItems: 'center',
    margin: 10,
  },
  avatarSelected: {
    opacity: 0.85,
  },
  initialAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 20,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 22,
  },
  avatarName: {
    fontSize: 13,
    textAlign: 'center',
    color: '#222',
    maxWidth: 90,
  },
  checkIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  loaderWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 8,
    color: '#43403e',
  },
  errorWrap: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#b00020',
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: '#3F0E40',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyText: {
    color: '#66615E',
  },
});

export default CreateProjectScreen;
