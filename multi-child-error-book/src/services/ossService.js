const OSS = require('ali-oss');
const config = require('../config/aliyun');

class OSSService {
  constructor() {
    this.client = new OSS({
      region: config.oss.region,
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || config.oss.accessKeyId,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || config.oss.accessKeySecret,
      bucket: config.oss.bucket
    });
  }

  // 上传文件到OSS
  async uploadFile(filePath, key) {
    try {
      const result = await this.client.put(key, filePath);
      return {
        success: true,
        url: result.url,
        key: result.name
      };
    } catch (error) {
      console.error('OSS upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 批量上传文件
  async uploadMultiple(files) {
    const results = [];
    for (const file of files) {
      const result = await this.uploadFile(file.path, file.key);
      results.push(result);
    }
    return results;
  }

  // 获取文件URL
  getUrl(key) {
    return `https://${config.oss.bucket}.${config.oss.region}.aliyuncs.com/${key}`;
  }

  // 删除文件
  async deleteFile(key) {
    try {
      await this.client.delete(key);
      return { success: true };
    } catch (error) {
      console.error('OSS delete error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new OSSService();