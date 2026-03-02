import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 本地存储服务 - 用于离线功能支持
 */
class LocalStorageService {
  /**
   * 保存错题到本地存储
   * @param {string} childId - 孩子ID
   * @param {Array} questions - 错题数组
   * @returns {Promise<void>}
   */
  static async saveErrorQuestions(childId, questions) {
    try {
      const key = `error_questions_${childId}`;
      await AsyncStorage.setItem(key, JSON.stringify(questions));
    } catch (error) {
      console.error('保存错题到本地存储失败:', error);
      throw error;
    }
  }

  /**
   * 获取本地存储的错题
   * @param {string} childId - 孩子ID
   * @returns {Promise<Array>} 错题数组
   */
  static async getErrorQuestions(childId) {
    try {
      const key = `error_questions_${childId}`;
      const storedData = await AsyncStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('获取本地错题失败:', error);
      return [];
    }
  }

  /**
   * 保存复习计划到本地
   * @param {string} childId - 孩子ID
   * @param {Array} reviewSchedules - 复习计划数组
   * @returns {Promise<void>}
   */
  static async saveReviewSchedules(childId, reviewSchedules) {
    try {
      const key = `review_schedules_${childId}`;
      await AsyncStorage.setItem(key, JSON.stringify(reviewSchedules));
    } catch (error) {
      console.error('保存复习计划到本地存储失败:', error);
      throw error;
    }
  }

  /**
   * 获取本地存储的复习计划
   * @param {string} childId - 孩子ID
   * @returns {Promise<Array>} 复习计划数组
   */
  static async getReviewSchedules(childId) {
    try {
      const key = `review_schedules_${childId}`;
      const storedData = await AsyncStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('获取本地复习计划失败:', error);
      return [];
    }
  }

  /**
   * 检查网络状态并同步数据
   * @param {Function} syncCallback - 同步回调函数
   * @returns {Promise<boolean>} 是否成功同步
   */
  static async checkAndSyncData(syncCallback) {
    try {
      // 检查网络状态（这里简化处理，实际应用中需要使用NetInfo）
      const isOnline = true; // 简化处理
      
      if (isOnline && syncCallback) {
        await syncCallback();
        return true;
      }
      return false;
    } catch (error) {
      console.error('检查和同步数据失败:', error);
      return false;
    }
  }

  /**
   * 清理本地存储
   * @param {string} childId - 孩子ID
   * @returns {Promise<void>}
   */
  static async clearChildData(childId) {
    try {
      await AsyncStorage.removeItem(`error_questions_${childId}`);
      await AsyncStorage.removeItem(`review_schedules_${childId}`);
    } catch (error) {
      console.error('清理本地数据失败:', error);
    }
  }
}

export default LocalStorageService;