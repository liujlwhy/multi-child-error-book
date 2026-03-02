# 阿里云OSS配置指南

## 1. 创建OSS Bucket
- 登录阿里云控制台
- 进入OSS服务
- 创建Bucket：`errorbook-oss-bucket`
- 区域选择：`cn-hangzhou`（与ECS同区域）
- 存储类型：标准存储
- 读写权限：私有

## 2. 创建RAM用户和AccessKey
- 进入RAM访问控制
- 创建用户：`errorbook-app`
- 授权策略：`AliyunOSSFullAccess`
- 记录AccessKey ID和AccessKey Secret

## 3. 配置CORS规则
在OSS Bucket的CORS设置中添加：

```json
[
  {
    "AllowedOrigin": ["*"],
    "AllowedMethod": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeader": ["*"],
    "ExposeHeader": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## 4. 更新应用配置
在`.env`文件中更新：

```env
ALIYUN_ACCESS_KEY_ID=your_actual_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_actual_access_key_secret
ALIYUN_OSS_REGION=cn-hangzhou
ALIYUN_OSS_BUCKET=errorbook-oss-bucket
```

## 5. 测试OSS连接
运行测试脚本验证OSS配置是否正确。