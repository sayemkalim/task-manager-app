import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ArrowLeft, X, CheckCircle } from 'lucide-react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-date-picker';

const colorPalette = [
  '#E91E63',
  '#4CAF50',
  '#009688',
  '#3F51B5',
  '#F44336',
  '#2196F3',
  '#8BC34A',
  '#FF5722',
];

const getColorForId = id => {
  if (!id) return colorPalette[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
};

const getInitial = name => {
  if (!name || typeof name !== 'string') return '?';
  const trimmed = name.trim();
  return trimmed.length ? trimmed[0].toUpperCase() : '?';
};

const fetchUsers = async () => {
  try {
    const response = await fetch(
      'https://signature-backend-bm3q.onrender.com/api/project-0/auth/users',
    );
    const data = await response.json();
    return data.users || [];
  } catch (err) {
    console.error('Fetch users error:', err);
    return [];
  }
};

const CreateTaskScreen = ({ navigation, route }) => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eta, setEta] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const projectId = route.params?.projectId || '';

  const bottomSheetRef = useRef(null);
  const snapPoints = ['50%'];

  const handleAddMemberPress = useCallback(async () => {
    setLoading(true);
    bottomSheetRef.current?.expand();
    const users = await fetchUsers();
    setAllUsers(users);
    setLoading(false);
  }, []);

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const toggleSelect = member => {
    setSelectedMembers(prev =>
      prev.some(m => m._id === member._id)
        ? prev.filter(m => m._id !== member._id)
        : [...prev, member],
    );
  };
  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    setApiLoading(true);

    try {
      const assignedToId =
        selectedMembers.length > 0 ? selectedMembers[0]._id : '';

      const response = await fetch(
        'https://signature-backend-bm3q.onrender.com/api/project-0/task',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: taskName,
            description: taskDescription,
            projectId: projectId,
            assignedTo: assignedToId,
            eta: eta.toISOString(),
          }),
        },
      );

      if (response.ok) {
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to create task');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Network error');
    } finally {
      setApiLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Task name"
          placeholderTextColor="#66615E"
          value={taskName}
          onChangeText={setTaskName}
        />

        <Text style={styles.label}>Add member</Text>
        <View style={styles.membersRow}>
          {selectedMembers.map(member => {
            const bg = getColorForId(member._id);
            const initial = getInitial(member.fullName);
            return (
              <View
                key={member._id}
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

        <Text style={styles.label}>Task Description</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Add Task description"
          placeholderTextColor="#66615E"
          multiline
          value={taskDescription}
          onChangeText={setTaskDescription}
        />

        {Platform.OS === 'ios' ? (
          <>
            <Text style={styles.label}>ETA (Date and Time)</Text>
            <DatePicker
              mode="datetime"
              date={eta}
              onDateChange={setEta}
              style={{ marginBottom: 30 }}
              locale="en"
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>ETA (Date and Time)</Text>
            <TouchableOpacity
              onPress={() => setDatePickerOpen(true)}
              style={styles.input}
            >
              <Text style={styles.inputText}>
                {eta.toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
            {datePickerOpen && (
              <DatePicker
                modal
                open={datePickerOpen}
                date={eta}
                onConfirm={date => {
                  setEta(date);
                  setDatePickerOpen(false);
                }}
                onCancel={() => {
                  setDatePickerOpen(false);
                }}
                mode="datetime"
              />
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTask}
          disabled={apiLoading}
        >
          <Text style={styles.createButtonText}>
            {apiLoading ? 'Creating...' : 'Create task'}
          </Text>
        </TouchableOpacity>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#faf9f7',
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
            placeholderTextColor="#8a8a8a"
            onChangeText={setSearchTerm}
            autoCorrect={false}
          />

          {loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.membersGrid}
              keyboardShouldPersistTaps="handled"
            >
              {filteredUsers.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No members found</Text>
                </View>
              ) : (
                filteredUsers.map(user => (
                  <TouchableOpacity
                    key={user._id}
                    onPress={() => toggleSelect(user)}
                    style={styles.memberWrapper}
                  >
                    <View
                      style={[
                        styles.memberInitialBox,
                        { backgroundColor: getColorForId(user._id) },
                        selectedMembers.some(m => m._id === user._id) &&
                          styles.memberSelectedBorder,
                      ]}
                    >
                      <Text style={styles.memberInitialText}>
                        {getInitial(user.fullName)}
                      </Text>
                    </View>
                    <Text numberOfLines={1} style={styles.memberName}>
                      {user.fullName || user.email}
                    </Text>
                    {selectedMembers.some(m => m._id === user._id) && (
                      <CheckCircle
                        size={20}
                        color="#4CAF50"
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  screen: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
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
  inputText: { color: '#000', fontSize: 16, padding: 12 },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  memberInitialBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitialText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1,
  },
  addLabelButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#363f5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMemberText: { fontSize: 36, fontWeight: '700', color: '#363f5f' },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#66615E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 30,
    color: '#000',
    fontSize: 16,
    minHeight: 100,
  },
  createButton: {
    backgroundColor: '#363f5f',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: { color: '#fff', fontWeight: '600', fontSize: 18 },
  sheetContent: { flex: 1 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  sheetSearch: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f4f3f3',
    fontSize: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    marginBottom: 18,
    color: '#8a8a8a',
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  memberWrapper: {
    width: 80,
    marginHorizontal: 6,
    marginBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  memberName: {
    marginTop: 6,
    fontSize: 14,
    color: '#4d4d4d',
    textAlign: 'center',
    maxWidth: 78,
    fontWeight: '500',
  },
  checkIcon: { position: 'absolute', right: 20, top: 2 },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyText: { color: '#66615E' },
});

export default CreateTaskScreen;
