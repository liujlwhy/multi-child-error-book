import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReviewSettingsScreen = ({ route, navigation }) => {
  const [settings, setSettings] = useState({
    dailyReminder: true,
    weeklyReminder: true,
    reminderTime: '19:00',
    customDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  });
  const [loading, setLoading] = useState(false);
  const childId = route.params?.childId;

  // 获取当前设置
  useEffect(() => {
    fetchReviewSettings();
  }, []);

  const fetchReviewSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/review-settings/${childId}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });
      
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('获取复习设置失败:', error);
      Alert.alert('错误', '获取设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存设置
  const saveSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/review-settings', {
        childId,
        ...settings
      }, {
        baseURL: 'http://localhost:3000',
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });
      
      if (response.data.success) {
        Alert.alert('成功', '复习设置已保存');
        navigation.goBack();
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      Alert.alert('错误', '保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换自定义天数
  const toggleDay = (day) => {
    const newDays = [...settings.customDays];
    const index = newDays.indexOf(day);
    
    if (index > -1) {
      newDays.splice(index, 1);
    } else {
      newDays.push(day);
    }
    
    setSettings({ ...settings, customDays: newDays });
  };

  const days = [
    { key: 'monday', label: '周一' },
    { key: 'tuesday', label: '周二' },
    { key: 'wednesday', label: '周三' },
    { key: 'thursday', label: '周四' },
    { key: 'friday', label: '周五' },
    { key: 'saturday', label: '周六' },
    { key: 'sunday', label: '周日' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>复习提醒设置</Text>
        <TouchableOpacity onPress={saveSettings} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 每日提醒 */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>每日复习提醒</Text>
          <Switch
            value={settings.dailyReminder}
            onValueChange={(value) => setSettings({ ...settings, dailyReminder: value })}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.dailyReminder ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        {/* 每周提醒 */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>每周复习提醒</Text>
          <Switch
            value={settings.weeklyReminder}
            onValueChange={(value) => setSettings({ ...settings, weeklyReminder: value })}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.weeklyReminder ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        {/* 提醒时间 */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>提醒时间</Text>
          <TextInput
            style={styles.timeInput}
            value={settings.reminderTime}
            onChangeText={(text) => setSettings({ ...settings, reminderTime: text })}
            placeholder="19:00"
            keyboardType="default"
          />
        </View>

        {/* 自定义提醒天数 */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>提醒天数</Text>
          <View style={styles.daysContainer}>
            {days.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  settings.customDays.includes(day.key) && styles.dayButtonSelected
                ]}
                onPress={() => toggleDay(day.key)}
              >
                <Text style={[
                  styles.dayButtonText,
                  settings.customDays.includes(day.key) && styles.dayButtonTextSelected
                ]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 说明文字 */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • 每日提醒会在指定时间推送需要复习的错题
          </Text>
          <Text style={styles.infoText}>
            • 每周提醒会在周日推送本周重点复习计划
          </Text>
          <Text style={styles.infoText}>
            • 基于艾宾浩斯遗忘曲线智能安排复习时间
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
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
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  timeInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    textAlign: 'right',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
  },
  dayButtonTextSelected: {
    color: 'white',
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f4ff',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default ReviewSettingsScreen;