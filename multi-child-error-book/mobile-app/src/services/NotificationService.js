import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 配置通知行为
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.setupNotificationListeners();
  }

  // 设置通知监听器
  setupNotificationListeners() {
    // 处理接收到的通知
    this.notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('收到通知:', notification);
      }
    );

    // 处理用户点击通知
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('用户点击通知:', response);
        const data = response.notification.request.content.data;
        if (data && data.childId) {
          // 导航到相应的复习页面
          this.handleNotificationNavigation(data);
        }
      }
    );
  }

  // 请求推送权限
  async requestPermissions() {
    let permissionStatus = await Notifications.getPermissionsAsync();
    
    if (permissionStatus.status !== 'granted') {
      permissionStatus = await Notifications.requestPermissionsAsync();
    }
    
    return permissionStatus.status === 'granted';
  }

  // 获取设备推送令牌
  async getDeviceToken() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('用户拒绝了推送权限');
        return null;
      }

      let token;
      if (Platform.OS === 'android') {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
        // iOS需要额外配置
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id', // 实际项目中需要配置
        })).data;
      }

      console.log('设备推送令牌:', token);
      return token;
    } catch (error) {
      console.error('获取推送令牌失败:', error);
      return null;
    }
  }

  // 发送本地通知（用于测试）
  async sendLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // 立即触发
    });
  }

  // 处理通知导航
  handleNotificationNavigation(data) {
    // 这里应该与导航系统集成
    // 由于我们使用React Navigation，需要通过全局事件或状态管理来处理
    console.log('处理通知导航:', data);
    
    // 可以通过全局状态或事件总线来触发导航
    if (global.onNotificationNavigate) {
      global.onNotificationNavigate(data);
    }
  }

  // 清理监听器
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();