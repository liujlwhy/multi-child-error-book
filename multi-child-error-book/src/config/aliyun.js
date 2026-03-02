const dotenv = require('dotenv');
dotenv.config();

// 阿里云配置
module.exports = {
  // 阿里云账号配置
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || 'your-access-key-id',
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || 'your-access-key-secret',
  region: process.env.ALIYUN_REGION || 'cn-hangzhou',

  // OSS配置
  oss: {
    bucket: process.env.OSS_BUCKET || 'error-book-app',
    region: process.env.OSS_REGION || 'oss-cn-hangzhou',
    endpoint: process.env.OSS_ENDPOINT || 'https://oss-cn-hangzhou.aliyuncs.com'
  },

  // 其他阿里云服务配置
  services: {
    // 如果使用函数计算或其他服务，在这里配置
  }
};