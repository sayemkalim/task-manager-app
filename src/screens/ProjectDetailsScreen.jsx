import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  CheckCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskCard = ({ task, navigation, forceRefresh }) => {
  const statusColor = {
    'to do': '#d63737',
    'in progress': '#cd8900',
    done: '#169e3a',
  };
  const [menuVisible, setMenuVisible] = useState(false);

  const handleDelete = async () => {
    setMenuVisible(false);
    try {
      const response = await fetch(
        `https://signature-backend-bm3q.onrender.com/api/project-0/task/${task._id}`,
        { method: 'DELETE' },
      );
      const json = await response.json();
      if (json.success) {
        Alert.alert('Success', 'Task deleted successfully');
        forceRefresh?.();
      } else {
        Alert.alert('Error', 'Failed to delete task');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('EditTaskScreen', { taskId: task._id });
  };

  return (
    <View style={styles.taskCard}>
      <View style={styles.checkWrapper}>
        {/* {task.isCompleted ? (
          <CheckCircle color="#169e4a" size={20} />
        ) : (
          <View style={styles.emptyCircle} />
        )} */}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskDescription}>{task.description}</Text>
        <View style={[styles.row, { marginBottom: 8 }]}>
          <Clock color="#888" size={14} style={{ marginRight: 6 }} />
          <Text style={styles.taskDate}>
            {task.eta
              ? new Date(task.eta).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'Not set'}
          </Text>
        </View>
        <Text style={styles.assignLabel}>Assign To</Text>
        {task.assignedTo && (
          <View style={styles.memberRowTask}>
            <View style={styles.memberAvatarTask}>
              <Text style={styles.avatarText}>
                {task.assignedTo.fullName?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.memberNameTask}>
                {task.assignedTo.fullName}
              </Text>
              <Text style={styles.memberEmailTask}>
                {task.assignedTo.email}
              </Text>
            </View>
          </View>
        )}
      </View>
      <View style={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}>
        <Text
          style={[
            styles.taskStatus,
            { color: statusColor[task.status?.toLowerCase() || 'to do'] },
          ]}
        >
          {task.status || 'to do'}
        </Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setMenuVisible(true)}
        >
          <MoreVertical size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Custom Menu Dialog */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <View style={styles.menuIcon}>
                <Edit size={18} color="#6272a4" />
              </View>
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <View style={styles.menuIcon}>
                <Trash2 size={18} color="#ff5555" />
              </View>
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const ProjectDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const project = route.params?.project;
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [userId, setUserId] = useState('');

  React.useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id || '');
    };
    getUserId();
  }, []);

  const forceRefreshTasks = useCallback(() => {
    if (!project || !userId) return;
    setLoadingTasks(true);
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `https://signature-backend-bm3q.onrender.com/api/project-0/project/tasks/${project._id}?userId=${userId}`,
        );
        const json = await response.json();
        setTasks(json.success ? json.data : []);
      } catch {
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [project, userId]);

  useFocusEffect(
    useCallback(() => {
      forceRefreshTasks();
      return () => {};
    }, [forceRefreshTasks]),
  );

  if (!project) {
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
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft size={25} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.projectName}>No Project Selected</Text>
        </View>
      </View>
    );
  }

  const createdAtDate = new Date(project.createdAt).toLocaleDateString();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F2F0EF"
        translucent={false}
      />
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={25} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{project.projectName}</Text>
            <Text style={styles.cardMeta}>{createdAtDate}</Text>
          </View>
          <Text style={styles.cardDescription}>
            {project.projectDescription}
          </Text>
          <View style={styles.cardSeparator} />
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsMembersOpen(!isMembersOpen)}
          >
            <View style={styles.accordionHeader}>
              <Text style={styles.accordionTitle}>Team Members</Text>
              {isMembersOpen ? (
                <ChevronDown color="#363f5f" size={20} />
              ) : (
                <ChevronRight color="#363f5f" size={20} />
              )}
            </View>
          </TouchableOpacity>
          {isMembersOpen && (
            <FlatList
              data={project.members}
              keyExtractor={m => m._id}
              renderItem={({ item }) => (
                <View style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.avatarText}>
                      {item.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.memberName}>{item.fullName}</Text>
                    <Text style={styles.memberEmail}>{item.email}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
        <Text style={styles.tasksHeader}>Tasks</Text>
        {loadingTasks ? (
          <ActivityIndicator
            size="large"
            color="#363f5f"
            style={{ marginVertical: 20 }}
          />
        ) : tasks.length === 0 ? (
          <Text style={styles.noTasks}>No tasks available</Text>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                navigation={navigation}
                forceRefresh={forceRefreshTasks}
              />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('CreateTaskScreen', { projectId: project._id })
        }
        activeOpacity={0.8}
      >
        <Plus size={26} color="#F2F0EF" />
      </TouchableOpacity>
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
    paddingVertical: 15,
  },
  backButton: {
    paddingRight: 15,
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#F2F0EF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    width: '100%',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#363f5f',
  },
  cardMeta: {
    fontSize: 14,
    color: '#888',
  },
  cardDescription: {
    fontSize: 16,
    color: '#535e79',
    marginBottom: 12,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: '#e9e9e9',
    width: '100%',
    marginVertical: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9e9e9',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#363f5f',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingLeft: 1,
  },
  memberRowTask: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#363f5f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberAvatarTask: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#363f5f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  memberNameTask: {
    fontSize: 14,
    color: '#363f5f',
    fontWeight: '500',
  },
  memberEmail: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  memberEmailTask: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
  },
  tasksHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#363f5f',
    marginTop: 20,
    marginBottom: 10,
  },
  noTasks: {
    marginTop: 20,
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#F2F0EF',
    borderRadius: 13,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    position: 'relative',
  },
  checkWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
  emptyCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#b1b1b1',
    backgroundColor: '#fff',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121212',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: '#555',
  },
  taskStatus: {
    fontSize: 12,
    marginBottom: 8,
    padding: 2,
    fontWeight: '500',
    textAlign: 'right',
  },
  assignLabel: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
    color: '#363f5f',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    padding: 8,
    marginLeft: 10,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#363f5f',
    width: 54,
    height: 54,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3.5,
  },
  // Modal & Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 180,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 24,
  },
  menuIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#363f5f',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e9e9e9',
    marginVertical: 2,
    marginHorizontal: 12,
  },
});

export default ProjectDetailsScreen;
