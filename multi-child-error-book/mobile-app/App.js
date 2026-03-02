import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from './screens/HomeScreen';
import ErrorQuestionsScreen from './screens/ErrorQuestionsScreen';
import ReviewScreen from './screens/ReviewScreen';
import ChildrenScreen from './screens/ChildrenScreen';
import ReviewSettingsScreen from './screens/ReviewSettingsScreen';
import { ApiService } from './src/services/api';

const Tab = createBottomTabNavigator();

// 全局配置
global.authToken = 'your-jwt-token-here'; // 实际应用中从安全存储获取

const App = () => {
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    // 初始化API服务
    ApiService.initialize()
      .then(() => setApiReady(true))
      .catch(error => console.error('API初始化失败:', error));
  }, []);

  if (!apiReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'ErrorQuestions') {
              iconName = 'assignment-late';
            } else if (route.name === 'Review') {
              iconName = 'book';
            } else if (route.name === 'Children') {
              iconName = 'people';
            } else if (route.name === 'ReviewSettings') {
              iconName = 'notifications';
            }
            
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: '首页' }}
        />
        <Tab.Screen 
          name="ErrorQuestions" 
          component={ErrorQuestionsScreen}
          options={{ title: '错题集' }}
        />
        <Tab.Screen 
          name="Review" 
          component={ReviewScreen}
          options={{ title: '复习' }}
        />
        <Tab.Screen 
          name="Children" 
          component={ChildrenScreen}
          options={{ title: '孩子管理' }}
        />
        <Tab.Screen 
          name="ReviewSettings" 
          component={ReviewSettingsScreen}
          options={{ title: '提醒设置' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;