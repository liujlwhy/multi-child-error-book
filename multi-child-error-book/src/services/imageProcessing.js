const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class ImageProcessingService {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
  }

  async initialize() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * 简化版手写去除 - 使用图像处理技术增强对比度
   * 实际生产环境中应使用更复杂的AI模型
   */
  async removeHandwriting(imageBuffer) {
    try {
      // 增强图像对比度和亮度来突出印刷体，淡化手写
      const processedImage = await sharp(imageBuffer)
        .modulate({
          brightness: 1.1,
          saturation: 0.9,
          hue: 0
        })
        .sharpen()
        .toBuffer();

      return processedImage;
    } catch (error) {
      console.error('Image processing failed:', error);
      throw new Error('Image processing failed');
    }
  }

  /**
   * 保存处理后的图像到临时目录
   */
  async saveProcessedImage(imageBuffer, filename) {
    const filePath = path.join(this.tempDir, filename);
    await fs.writeFile(filePath, imageBuffer);
    return filePath;
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFiles() {
    try {
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        await fs.unlink(path.join(this.tempDir, file));
      }
    } catch (error) {
      console.error('Failed to cleanup temp files:', error);
    }
  }
}

module.exports = new ImageProcessingService();