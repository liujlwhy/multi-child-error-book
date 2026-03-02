import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingIndicator from '../src/components/LoadingIndicator';
import ErrorDisplay from '../src/components/ErrorDisplay';
import LoadingIndicator from '../src/components/LoadingIndicator';

const ErrorQuestionsScreen = ({ route, navigation }) => {
  const [errorQuestions, setErrorQuestions] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  // 获取孩子列表和错题
  useEffect(() => {
    fetchChildren();
    fetchErrorQuestions();
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
      if (response.data.length > 0) {
        setSelectedChild(response.data[0]);
      }
    } catch (error) {
      console.error('获取孩子列表失败:', error);
    }
  };

  const fetchErrorQuestions = async (childId = null) => {
    setLoading(true);
    try {
      const params = childId ? { childId } : {};
      const response = await axios.get('/api/error-questions', {
        baseURL: 'http://localhost:3000',
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        },
        params
      });
      setErrorQuestions(response.data);
    } catch (error) {
      console.error('获取错题列表失败:', error);
      Alert.alert('错误', '获取错题列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换孩子查看错题
  const switchChildQuestions = (child) => {
    setSelectedChild(child);
    fetchErrorQuestions(child._id);
  };

  // 查看错题详情
  const viewQuestionDetail = (question) => {
    setSelectedQuestion(question);
    setModalVisible(true);
  };

  // 删除错题
  const deleteQuestion = async (questionId) => {
    Alert.alert(
      '确认删除',
      '确定要删除这道错题吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/api/error-questions/${questionId}`, {
                baseURL: 'http://localhost:3000',
                headers: {
                  'Authorization': `Bearer ${global.authToken}`
                }
              });
              
              setErrorQuestions(errorQuestions.filter(q => q._id !== questionId));
              Alert.alert('成功', '错题已删除');
            } catch (error) {
              console.error('删除错题失败:', error);
              Alert.alert('错误', '删除错题失败');
            }
          }
        }
      ]
    );
  };

  // 生成举一反三练习卷
  const generatePracticePaper = async (question) => {
    Alert.alert(
      '生成练习卷',
      '是否要为这道错题生成举一反三练习卷？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '生成', 
          onPress: async () => {
            try {
              setLoading(true);
              const response = await axios.get(`/api/recommendation/similar/${question._id}`, {
                baseURL: 'http://localhost:3000',
                headers: {
                  'Authorization': `Bearer ${global.authToken}`
                }
              });
              
              const similarQuestions = response.data.data;
              const practicePaper = {
                title: `针对"${question.ocrText?.substring(0, 20)}..."的练习卷`,
                questions: [
                  { ...question, isOriginal: true },
                  ...similarQuestions.map(q => ({ ...q, isRecommended: true }))
                ],
                createdAt: new Date()
              };
              
              // 跳转到PDF生成
              navigation.navigate('Review', { practicePaper });
              setLoading(false);
            } catch (error) {
              console.error('生成练习卷失败:', error);
              Alert.alert('错误', '生成练习卷失败');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // 渲染错题卡片
  const renderQuestionCard = ({ item }) => (
    <View style={styles.questionCard}>
      <View style={styles.questionContent}>
        <Text style={styles.questionText} numberOfLines={3}>
          {item.ocrText || '题目内容'}
        </Text>
        {item.errorReason && (
          <Text style={styles.errorReason}>
            错误原因: {item.errorReason}
          </Text>
        )}
        {item.knowledgePoints && item.knowledgePoints.length > 0 && (
          <Text style={styles.knowledgePoints}>
            知识点: {item.knowledgePoints.join(', ')}
          </Text>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => viewQuestionDetail(item)}
        >
          <Icon name="visibility" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => generatePracticePaper(item)}
        >
          <Icon name="auto-awesome" size={20} color="#34C759" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => deleteQuestion(item._id)}
        >
          <Icon name="delete" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的错题集</Text>
        
        {/* 孩子切换 */}
        {children.length > 1 && (
          <View style={styles.childSelector}>
            <Text style={styles.childLabel}>查看:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {children.map(child => (
                <TouchableOpacity
                  key={child._id}
                  style={[
                    styles.childChip,
                    selectedChild?._id === child._id && styles.childChipSelected
                  ]}
                  onPress={() => switchChildQuestions(child)}
                >
                  <Text style={[
                    styles.childChipText,
                    selectedChild?._id === child._id && styles.childChipTextSelected
                  ]}>
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>加载中...</Text>
        </View>
      ) : errorQuestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>还没有错题记录</Text>
          <TouchableOpacity 
            style={styles.addQuestionButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.addQuestionButtonText}>去首页拍照添加</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={errorQuestions}
          renderItem={renderQuestionCard}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* 错题详情模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedQuestion && (
          <View style={styles.detailModalContainer}>
            <View style={styles.detailModalContent}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>错题详情</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.detailContent}>
                <Text style={styles.detailQuestionText}>
                  {selectedQuestion.ocrText}
                </Text>
                
                {selectedQuestion.originalImage && (
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>原题图片:</Text>
                    <Image 
                      source={{ uri: selectedQuestion.originalImage }} 
                      style={styles.questionImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                
                {selectedQuestion.cleanedImage && (
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>去手写后:</Text>
                    <Image 
                      source={{ uri: selectedQuestion.cleanedImage }} 
                      style={styles.questionImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoText}>
                    <Text style={styles.detailInfoLabel}>学科:</Text>
                    {selectedQuestion.subject}
                  </Text>
                  <Text style={styles.detailInfoText}>
                    <Text style={styles.detailInfoLabel}>年级:</Text>
                    {selectedQuestion.grade}
                  </Text>
                  <Text style={styles.detailInfoText}>
                    <Text style={styles.detailInfoLabel}>错误原因:</Text>
                    {selectedQuestion.errorReason}
                  </Text>
                  <Text style={styles.detailInfoText}>
                    <Text style={styles.detailInfoLabel}>知识点:</Text>
                    {selectedQuestion.knowledgePoints?.join(', ')}
                  </Text>
                  <Text style={styles.detailInfoText}>
                    <Text style={styles.detailInfoLabel}>添加时间:</Text>
                    {new Date(selectedQuestion.createdAt).toLocaleString('zh-CN')}
                  </Text>
                </View>
              </ScrollView>
              
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.detailActionButton}
                  onPress={() => {
                    setModalVisible(false);
                    generatePracticePaper(selectedQuestion);
                  }}
                >
                  <Text style={styles.detailActionText}>生成练习卷</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

import { commonStyles } from '../src/styles/commonStyles';

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  childSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  childChip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  childChipSelected: {
    backgroundColor: '#007AFF',
  },
  childChipText: {
    fontSize: 14,
    color: '#666',
  },
  childChipTextSelected: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
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
  addQuestionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addQuestionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...commonStyles.shadow,
  },
  questionContent: {
    flex: 1,
    marginRight: 15,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  errorReason: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 4,
  },
  knowledgePoints: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  detailModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  detailModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  detailContent: {
    padding: 20,
  },
  detailQuestionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  detailInfo: {
    marginTop: 20,
  },
  detailInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailInfoLabel: {
    fontWeight: '600',
    color: '#333',
  },
  detailActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailActionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorQuestionsScreen;