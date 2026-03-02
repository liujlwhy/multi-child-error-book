const admin = require('firebase-admin');
const path = require('path');

/**
 * Firebase Cloud Messaging 推送通知服务
 */
class PushNotificationService {
  constructor() {
    this.initializeFirebase();
  }

  // 初始化Firebase Admin SDK
  initializeFirebase() {
    try {
      // 使用环境变量中的Firebase配置
      const firebaseConfig = {
        type: process.env.FIREBASE_TYPE,
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: process.env.FIREBASE_AUTH_URI,
        tokenUri: process.env.FIREBASE_TOKEN_URI,
        authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        clientC509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };

      // 移除空值属性
      Object.keys(firebaseConfig).forEach(key => {
        if (!firebaseConfig[key]) delete firebaseConfig[key];
      });

      if (Object.keys(firebaseConfig).length > 0) {
        admin.initializeApp({
          credential: admin.credential.cert(firebaseConfig)
        });
        this.isInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
      } else {
        console.warn('⚠️ Firebase configuration not found, using mock notification service');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      this.isInitialized = false;
    }
  }

  // 发送推送通知（支持单个设备或多个设备）
  async sendNotification(tokens, title, body, data = {}) {
    if (!this.isInitialized) {
      // 使用模拟通知服务
      console.log(`[MOCK NOTIFICATION] Title: ${title}, Body: ${body}, Data:`, data);
      return { success: true, message: 'Mock notification sent' };
    }

    try {
      const message = {
        notification: {
          title: title,
          body: body
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        tokens: Array.isArray(tokens) ? tokens : [tokens]
      };

      const response = await admin.messaging().sendMulticast(message);
      
      console.log(`✅ Notification sent to ${response.successCount} devices`);
      if (response.failureCount > 0) {
        console.warn(`⚠️ Failed to send to ${response.failureCount} devices`);
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      throw error;
    }
  }

  // 为特定用户发送复习提醒
  async sendReviewReminder(userId, childName, questionCount, tokens) {
    const title = '📚 复习提醒';
    const body = `【${childName}】有${questionCount}道错题需要复习！点击查看详情`;
    const data = {
      type: 'review_reminder',
      userId: userId,
      childName: childName,
      questionCount: questionCount.toString()
    };

    return await this.sendNotification(tokens, title, body, data);
  }

  // 发送练习卷生成完成通知
  async sendPracticePaperReady(userId, childName, tokens) {
    const title = '📄 练习卷已生成';
    const body = `【${childName}】的智能练习卷已准备就绪，点击查看！`;
    const data = {
      type: 'practice_paper_ready',
      userId: userId,
      childName: childName
    };

    return await this.sendNotification(tokens, title, body, data);
  }

  // 注册设备令牌
  async registerDeviceToken(userId, deviceId, token) {
    try {
      // 这里可以将设备令牌存储到数据库中
      // 实际实现需要UserDevice模型
      console.log(`📱 Device token registered for user ${userId}: ${token.substring(0, 20)}...`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to register device token:', error);
      throw error;
    }
  }
}

module.exports = new PushNotificationService();