import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  TextInput,
} from 'react-native';
import { Plus, Lock, Search } from 'lucide-react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const route = useRoute();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    if (route.params?.selectedCompany) {
      setSelectedCompany(route.params.selectedCompany);
    }
  }, [route.params?._ts]);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedCompany?.id) {
        const apiUrl = `https://signature-backend-bm3q.onrender.com/api/project-0/company/${selectedCompany.id}/projects`;
        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            setProjects(data.data);
          })
          .catch(error => {
            console.error('Error fetching projects:', error);
          });
      }
    }, [selectedCompany]),
  );

  const handlePlusPress = () => {
    if (selectedCompany?.id) {
      navigation.navigate('CreateProjectScreen', {
        companyId: selectedCompany.id,
      });
    } else {
      navigation.navigate('CreateProjectScreen');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  const renderProject = ({ item, index }) => (
    <View>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.projectRow}
        onPress={() =>
          navigation.navigate('ProjectDetailsScreen', { project: item })
        }
      >
        {item.isPrivate ? (
          <Lock size={16} color="#888" style={{ marginRight: 8 }} />
        ) : (
          <Text style={styles.hashIcon}>#</Text>
        )}
        <Text style={styles.projectName}>{item.projectName}</Text>
      </TouchableOpacity>
      {index !== filteredProjects.length - 1 && (
        <View style={styles.separator} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarWrapper}>
        <Search size={20} color="#e5d5ea" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search Projects"
          placeholderTextColor="#e5d5ea"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <Text style={styles.sectionHeader}>Projects</Text>
      <FlatList
        data={filteredProjects}
        keyExtractor={item => item._id}
        renderItem={renderProject}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handlePlusPress}
        activeOpacity={0.8}
      >
        <Plus size={26} color="#F2F0EF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },

  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#535e79',
    borderRadius: 12,
    paddingLeft: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#f0e6f6',
    height: 48,
    paddingHorizontal: 6,
    backgroundColor: 'transparent',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  hashIcon: {
    fontSize: 17,
    color: '#998f84',
    marginRight: 8,
    fontWeight: 'bold',
  },
  projectName: { fontSize: 15, color: '#2c2c2c' },
  separator: { marginLeft: 24, height: 1, backgroundColor: '#ececec' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#363f5f',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});

export default HomeScreen;
