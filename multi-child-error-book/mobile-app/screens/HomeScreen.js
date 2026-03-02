import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);

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
      if (response.data.length > 0) {
        setSelectedChild(response.data[0]);
      }
    } catch (error) {
      console.error('获取孩子列表失败:', error);
      Alert.alert('错误', '获取孩子列表失败');
    }
  };

  // 请求相机权限
  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限被拒绝', '需要相机权限才能拍照');
        return false;
      }
    }
    return true;
  };

  // 拍照录入错题
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // 跳转到错题处理页面
      navigation.navigate('ErrorQuestions', {
        imageUri: result.assets[0].uri,
        childId: selectedChild?._id
      });
    }
  };

  // 一键切换孩子
  const switchChild = (child) => {
    setSelectedChild(child);
    Alert.alert('切换成功', `已切换到 ${child.name}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 孩子切换区域 */}
      <View style={styles.childSwitchContainer}>
        <Text style={styles.sectionTitle}>当前孩子:</Text>
        {selectedChild && (
          <TouchableOpacity 
            style={styles.childButton}
            onPress={() => navigation.navigate('Children')}
          >
            <Text style={styles.childName}>{selectedChild.name}</Text>
            <Text style={styles.childGrade}>{selectedChild.grade}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 主要功能按钮 */}
      <View style={styles.mainButtons}>
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          <Text style={styles.photoButtonText}>📸 拍照录入错题</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reviewButton}
          onPress={() => navigation.navigate('Review')}
        >
          <Text style={styles.reviewButtonText}>📚 今日复习</Text>
        </TouchableOpacity>
      </View>

      {/* 快捷入口 */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('ErrorQuestions')}
        >
          <Text style={styles.actionButtonText}>我的错题集</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('功能开发中', 'PDF导出功能即将上线')}
        >
          <Text style={styles.actionButtonText}>📄 导出PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  childSwitchContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  childButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  childName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  childGrade: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  mainButtons: {
    marginBottom: 30,
  },
  photoButton: {
    backgroundColor: '#FF9500',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewButton: {
    backgroundColor: '#34C759',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flex: 0.45,
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
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeScreen;