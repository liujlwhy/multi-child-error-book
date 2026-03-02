import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from './NotificationService';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.token = null;
    this.initialize();
  }

  async initialize() {
    try {
      // 从本地存储获取token
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        this.token = token;
        this.setupAxios();
      }
      
      // 初始化通知服务
      await NotificationService.initialize();
    } catch (error) {
      console.error('API初始化失败:', error);
    }
  }

  setupAxios() {
    axios.defaults.baseURL = this.baseURL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
  }

  async setAuthToken(token) {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
    this.setupAxios();
  }

  async clearAuthToken() {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  }

  // 用户相关API
  async login(email, password) {
    const response = await axios.post('/api/users/login', { email, password });
    await this.setAuthToken(response.data.token);
    return response.data;
  }

  async register(userData) {
    const response = await axios.post('/api/users/register', userData);
    return response.data;
  }

  // 孩子管理API
  async getChildren() {
    const response = await axios.get('/api/children');
    return response.data;
  }

  async createChild(childData) {
    const response = await axios.post('/api/children', childData);
    return response.data;
  }

  // 错题管理API
  async getErrorQuestions(childId) {
    const params = childId ? { childId } : {};
    const response = await axios.get('/api/questions', { params });
    return response.data;
  }

  async createErrorQuestion(questionData) {
    const response = await axios.post('/api/questions', questionData);
    return response.data;
  }

  async uploadErrorQuestion(formData) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await axios.post('/api/questions/upload', formData, config);
    return response.data;
  }

  // 复习提醒API
  async getTodayReviewQuestions() {
    const response = await axios.get('/api/review/today');
    return response.data;
  }

  async markReviewCompleted(scheduleId, reviewDate) {
    const response = await axios.post('/api/review/complete', { scheduleId, reviewDate });
    return response.data;
  }

  async getReviewSettings(childId) {
    const response = await axios.get(`/api/review-settings/${childId}`);
    return response.data;
  }

  async updateReviewSettings(childId, settings) {
    const response = await axios.put(`/api/review-settings/${childId}`, settings);
    return response.data;
  }

  // PDF生成API
  async generatePracticePaper(practicePaper, mode = 'practice') {
    const response = await axios.post('/api/pdf/practice-paper', { practicePaper, mode });
    return response.data;
  }

  async exportErrorQuestionsPDF(errorQuestions, childName, subject) {
    const response = await axios.post('/api/pdf/error-questions', { errorQuestions, childName, subject });
    return response.data;
  }

  // 推荐API
  async getSimilarQuestions(questionId, count = 5) {
    const response = await axios.get(`/api/recommendation/similar/${questionId}`, { 
      params: { count } 
    });
    return response.data;
  }

  // 离线功能
  async syncOfflineData() {
    // 同步本地存储的离线数据到服务器
    const offlineQuestions = await AsyncStorage.getItem('offlineQuestions');
    if (offlineQuestions) {
      const questions = JSON.parse(offlineQuestions);
      for (const question of questions) {
        try {
          await this.createErrorQuestion(question);
        } catch (error) {
          console.error('同步离线数据失败:', error);
        }
      }
      await AsyncStorage.removeItem('offlineQuestions');
    }
  }

  // 错误处理
  handleError(error) {
    if (error.response) {
      // 服务器返回错误
      switch (error.response.status) {
        case 401:
          this.clearAuthToken();
          // 跳转到登录页面
          break;
        case 403:
          // 权限错误
          break;
        case 500:
          // 服务器内部错误
          break;
        default:
          break;
      }
    } else if (error.request) {
      // 网络错误，保存到离线存储
      console.log('网络错误，保存到离线存储');
    }
  }
}

// 创建全局实例
const apiService = new ApiService();

export default apiService;