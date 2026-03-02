const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// 阿里云OSS客户端
const OSS = require('ali-oss');
const client = new OSS({
  region: process.env.ALIYUN_OSS_REGION,
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  bucket: process.env.ALIYUN_OSS_BUCKET
});

/**
 * 智能拍照录入与手写去除控制器
 */
class OCRController {
  /**
   * 处理上传的错题图片
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  static async processErrorQuestionImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '请提供图片文件' });
      }

      const { childId, subject, grade } = req.body;
      const originalImagePath = req.file.path;
      
      // 1. 上传原始图片到OSS
      const originalImageKey = `original/${uuidv4()}_${req.file.originalname}`;
      const originalImageUrl = await this.uploadToOSS(originalImagePath, originalImageKey);
      
      // 2. 调用AI手写去除服务
      const cleanedImagePath = await this.removeHandwriting(originalImagePath);
      const cleanedImageKey = `cleaned/${uuidv4()}_${req.file.originalname}`;
      const cleanedImageUrl = await this.uploadToOSS(cleanedImagePath, cleanedImageKey);
      
      // 3. 调用OCR服务识别文字
      const ocrText = await this.performOCR(cleanedImagePath);
      
      // 4. 清理临时文件
      await this.cleanupTempFiles([originalImagePath, cleanedImagePath]);
      
      // 5. 返回处理结果
      res.json({
        success: true,
        data: {
          originalImage: originalImageUrl,
          cleanedImage: cleanedImageUrl,
          ocrText: ocrText,
          childId: childId,
          subject: subject,
          grade: grade
        }
      });
    } catch (error) {
      console.error('处理错题图片错误:', error);
      res.status(500).json({ message: '图片处理失败', error: error.message });
    }
  }

  /**
   * 上传文件到阿里云OSS
   * @param {string} filePath - 本地文件路径
   * @param {string} key - OSS中的文件key
   * @returns {Promise<string>} - OSS文件URL
   */
  static async uploadToOSS(filePath, key) {
    try {
      const result = await client.put(key, filePath);
      return result.url;
    } catch (error) {
      console.error('OSS上传失败:', error);
      throw new Error('文件上传失败');
    }
  }

  /**
   * 调用AI服务去除手写痕迹
   * @param {string} imagePath - 原始图片路径
   * @returns {Promise<string>} - 处理后的图片路径
   */
  static async removeHandwriting(imagePath) {
    // 这里需要集成实际的AI手写去除服务
    // 临时实现：使用sharp进行简单的图像处理作为占位
    const outputPath = path.join(path.dirname(imagePath), `cleaned_${path.basename(imagePath)}`);
    
    try {
      // 简单的图像增强处理（实际应调用专业的AI服务）
      await sharp(imagePath)
        .sharpen()
        .contrast(1.1)
        .brightness(1.05)
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('手写去除处理失败:', error);
      // 如果AI处理失败，返回原图作为备选
      return imagePath;
    }
  }

  /**
   * 执行OCR文字识别
   * @param {string} imagePath - 图片路径
   * @returns {Promise<string>} - 识别出的文本
   */
  static async performOCR(imagePath) {
    // 这里需要集成实际的OCR服务
    // 临时实现：返回模拟的OCR结果
    if (process.env.NODE_ENV === 'development') {
      return '这是一道数学题：计算 25 × 36 = ?\n解：25 × 36 = 25 × (4 × 9) = (25 × 4) × 9 = 100 × 9 = 900';
    }
    
    try {
      // 调用实际的OCR API
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));
      formData.append('api_key', process.env.OCR_API_KEY);
      
      const response = await axios.post(process.env.OCR_ENDPOINT, formData, {
        headers: formData.getHeaders()
      });
      
      return response.data.text || '';
    } catch (error) {
      console.error('OCR识别失败:', error);
      return '';
    }
  }

  /**
   * 清理临时文件
   * @param {string[]} filePaths - 文件路径数组
   */
  static async cleanupTempFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        console.warn('清理临时文件失败:', filePath, error.message);
      }
    }
  }
}

module.exports = OCRController;