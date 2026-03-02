import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReviewScreen = ({ navigation }) => {
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 获取今日待复习题目
  const fetchTodayReviewQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/review/today', {
        baseURL: 'http://localhost:3000',
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });
      setReviewQuestions(response.data.data || []);
    } catch (error) {
      console.error('获取复习题目失败:', error);
      Alert.alert('错误', '获取复习题目失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 标记题目为已完成
  const markQuestionCompleted = async (scheduleId, reviewDate) => {
    try {
      await axios.post('/api/review/complete', {
        scheduleId,
        reviewDate
      }, {
        baseURL: 'http://localhost:3000',
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });
      
      // 更新本地状态
      setReviewQuestions(reviewQuestions.filter(q => 
        !(q.scheduleId === scheduleId && 
          Math.abs(new Date(q.reviewTime).getTime() - new Date(reviewDate).getTime()) < 3600000)
      ));
      
      Alert.alert('成功', '题目已完成复习');
    } catch (error) {
      console.error('标记完成失败:', error);
      Alert.alert('错误', '标记完成失败');
    }
  };

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    fetchTodayReviewQuestions();
  };

  // 初始化
  useEffect(() => {
    fetchTodayReviewQuestions();
    
    // 设置定时刷新（每5分钟）
    const interval = setInterval(fetchTodayReviewQuestions, 300000);
    return () => clearInterval(interval);
  }, []);

  // 渲染复习题目项
  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.questionInfo}>
        <Text style={styles.childName}>{item.child?.name} - {item.child?.grade}</Text>
        <Text style={styles.subject}>{item.errorQuestion?.subject}</Text>
        <Text style={styles.questionText} numberOfLines={3}>
          {item.errorQuestion?.ocrText || '题目内容'}
        </Text>
        {item.errorQuestion?.errorReason && (
          <Text style={styles.errorReason}>
            错误原因: {item.errorQuestion.errorReason}
          </Text>
        )}
        <Text style={styles.reviewTime}>
          复习时间: {new Date(item.reviewTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.completeButton}
        onPress={() => markQuestionCompleted(item.scheduleId, item.reviewTime)}
      >
        <Icon name="check-circle" size={24} color="#34C759" />
        <Text style={styles.completeButtonText}>已完成</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>今日复习</Text>
        <TouchableOpacity onPress={fetchTodayReviewQuestions}>
          <Icon name="refresh" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {loading && reviewQuestions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : reviewQuestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="book" size={60} color="#ccc" />
          <Text style={styles.emptyText}>今天没有待复习的题目</Text>
          <TouchableOpacity 
            style={styles.goToQuestionsButton}
            onPress={() => navigation.navigate('ErrorQuestions')}
          >
            <Text style={styles.goToQuestionsButtonText}>去错题集添加题目</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reviewQuestions}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.scheduleId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 复习统计 */}
      {reviewQuestions.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            今日待复习: {reviewQuestions.length} 题
          </Text>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  goToQuestionsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  goToQuestionsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionInfo: {
    flex: 1,
    marginRight: 15,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subject: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  errorReason: {
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 8,
  },
  reviewTime: {
    fontSize: 12,
    color: '#666',
  },
  completeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  completeButtonText: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 5,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default ReviewScreen;