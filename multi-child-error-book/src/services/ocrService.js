/**
 * 模拟OCR服务 - 在开发环境中使用
 * 生产环境中应替换为真实的OCR API（如阿里云OCR）
 */

class MockOCRService {
  async performOCR(imageBuffer, options = {}) {
    // 模拟OCR结果
    const mockResults = [
      '解：设这个数为x，则有2x + 5 = 15，解得x = 5',
      '答案：三角形的内角和为180度',
      '计算：3.14 × 2² = 12.56',
      '解析：根据勾股定理，a² + b² = c²',
      '步骤：先通分，再计算分子'
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    return {
      text: randomResult,
      confidence: 0.92,
      metadata: {
        processingTime: 120,
        wordCount: randomResult.split(' ').length,
        language: 'zh'
      }
    };
  }
}

module.exports = new MockOCRService();