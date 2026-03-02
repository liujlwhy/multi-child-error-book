import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChildrenScreen = ({ navigation }) => {
  const [children, setChildren] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    subjects: []
  });
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const availableSubjects = ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '科学'];

  // 获取孩子列表
  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await axios.get('/api/children', {
        baseURL: 'http://localhost:3000',
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });
      setChildren(response.data);
    } catch (error) {
      console.error('获取孩子列表失败:', error);
      Alert.alert('错误', '获取孩子列表失败');
    }
  };

  // 创建新孩子档案
  const createChild = async () => {
    if (!formData.name || !formData.grade) {
      Alert.alert('错误', '姓名和年级不能为空');
      return;
    }
    
    if (selectedSubjects.length === 0) {
      Alert.alert('错误', '至少选择一个学科');
      return;
    }

    try {
      const response = await axios.post('/api/children', {
        name: formData.name,
        grade: formData.grade,
        subjects: selectedSubjects
      }, {
        baseURL: 'http://localhost:3000',
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });
      
      setChildren([...children, response.data]);
      resetForm();
      setModalVisible(false);
      Alert.alert('成功', '孩子档案创建成功');
    } catch (error) {
      console.error('创建孩子档案失败:', error);
      Alert.alert('错误', '创建孩子档案失败');
    }
  };

  // 删除孩子档案
  const deleteChild = async (childId, childName) => {
    Alert.alert(
      '确认删除',
      `确定要删除 ${childName} 的档案吗？这将同时删除所有相关错题数据。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/api/children/${childId}`, {
                baseURL: 'http://localhost:3000',
                headers: {
                  'Authorization': `Bearer ${global.authToken}`
                }
              });
              
              setChildren(children.filter(child => child._id !== childId));
              Alert.alert('成功', '孩子档案已删除');
            } catch (error) {
              console.error('删除孩子档案失败:', error);
              Alert.alert('错误', '删除孩子档案失败');
            }
          }
        }
      ]
    );
  };

  // 切换学科选择
  const toggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({ name: '', grade: '', subjects: [] });
    setSelectedSubjects([]);
  };

  // 渲染孩子卡片
  const renderChildCard = ({ item }) => (
    <View style={styles.childCard}>
      <View style={styles.childInfo}>
        <Text style={styles.childName}>{item.name}</Text>
        <Text style={styles.childGrade}>{item.grade}</Text>
        <Text style={styles.childSubjects}>学科: {item.subjects.join(', ')}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteChild(item._id, item.name)}
      >
        <Icon name="delete" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>孩子管理</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {children.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>还没有添加孩子档案</Text>
          <TouchableOpacity 
            style={styles.addFirstButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addFirstButtonText}>添加第一个孩子</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={children}
          renderItem={renderChildCard}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 添加孩子模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加孩子档案</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>姓名 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入孩子姓名"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>年级 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="例如：三年级"
                  value={formData.grade}
                  onChangeText={(text) => setFormData({...formData, grade: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>选择学科 *</Text>
                <View style={styles.subjectsContainer}>
                  {availableSubjects.map((subject) => (
                    <TouchableOpacity
                      key={subject}
                      style={[
                        styles.subjectButton,
                        selectedSubjects.includes(subject) && styles.subjectButtonSelected
                      ]}
                      onPress={() => toggleSubject(subject)}
                    >
                      <Text style={[
                        styles.subjectButtonText,
                        selectedSubjects.includes(subject) && styles.subjectButtonTextSelected
                      ]}>
                        {subject}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={createChild}
                >
                  <Text style={styles.submitButtonText}>创建档案</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  childCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  childGrade: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  childSubjects: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    maxHeight: '70%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  subjectButtonSelected: {
    backgroundColor: '#007AFF',
  },
  subjectButtonText: {
    fontSize: 14,
    color: '#666',
  },
  subjectButtonTextSelected: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    marginLeft: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ChildrenScreen;