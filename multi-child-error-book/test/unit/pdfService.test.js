const PDFService = require('../../src/services/pdfService');
const fs = require('fs').promises;
const path = require('path');

// Mock Puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setViewport: jest.fn(),
      setContent: jest.fn(),
      pdf: jest.fn(),
      close: jest.fn()
    }),
    close: jest.fn()
  })
}));

// Mock OSS Service
jest.mock('../../src/services/ossService', () => ({
  uploadFile: jest.fn().mockResolvedValue('https://mock-oss-url.com/test.pdf')
}));

describe('PDFService', () => {
  let mockQuestions;

  beforeEach(() => {
    mockQuestions = [
      {
        id: '1',
        content: '这是一道数学题',
        originalImageUrl: 'https://mock-oss-url.com/original.jpg',
        cleanImageUrl: 'https://mock-oss-url.com/clean.jpg',
        answer: '答案是42',
        explanation: '详细解析...'
      },
      {
        id: '2', 
        content: '这是另一道题',
        originalImageUrl: null,
        cleanImageUrl: null,
        answer: '答案是24',
        explanation: '另一个解析...'
      }
    ];
  });

  afterEach(async () => {
    // 清理临时文件
    const tmpDir = '/tmp';
    const files = await fs.readdir(tmpDir);
    const pdfFiles = files.filter(file => file.includes('错题集') && file.endsWith('.pdf'));
    for (const file of pdfFiles) {
      try {
        await fs.unlink(path.join(tmpDir, file));
      } catch (error) {
        // 忽略清理错误
      }
    }
  });

  describe('generateErrorBookPDF', () => {
    test('should generate PDF in practice mode', async () => {
      const filePath = await PDFService.generateErrorBookPDF(
        mockQuestions,
        { mode: 'practice', paperSize: 'A4' },
        '小明'
      );

      expect(filePath).toContain('/tmp/');
      expect(filePath).toContain('小明_错题集');
      expect(filePath).toMatch(/\.pdf$/);
    });

    test('should generate PDF in review mode', async () => {
      const filePath = await PDFService.generateErrorBookPDF(
        mockQuestions,
        { mode: 'review', paperSize: 'A4' },
        '小红'
      );

      expect(filePath).toContain('/tmp/');
      expect(filePath).toContain('小红_错题集');
      expect(filePath).toMatch(/\.pdf$/);
    });

    test('should handle questions without images', async () => {
      const questionsWithoutImages = mockQuestions.map(q => ({
        ...q,
        originalImageUrl: null,
        cleanImageUrl: null
      }));

      const filePath = await PDFService.generateErrorBookPDF(
        questionsWithoutImages,
        { mode: 'practice' },
        '小华'
      );

      expect(filePath).toContain('/tmp/');
    });
  });

  describe('uploadPDFToOSS', () => {
    test('should upload PDF to OSS and return URL', async () => {
      // 创建一个临时PDF文件用于测试
      const testFilePath = '/tmp/test-upload.pdf';
      await fs.writeFile(testFilePath, 'mock pdf content');
      
      const url = await PDFService.uploadPDFToOSS(testFilePath, 'child123');
      
      expect(url).toBe('https://mock-oss-url.com/test.pdf');
      
      // 清理测试文件
      await fs.unlink(testFilePath);
    });
  });

  describe('buildPDFHTML', () => {
    test('should build HTML with practice mode layout', () => {
      const options = { mode: 'practice', paperSize: 'A4' };
      const html = PDFService.buildPDFHTML(mockQuestions, options);
      
      expect(html).toContain('<title>智能错题集</title>');
      expect(html).toContain('第1题');
      expect(html).toContain('第2题');
      // 在刷题模式下，答案应该在最后
      expect(html).toContain('答案与解析');
    });

    test('should build HTML with review mode layout', () => {
      const options = { mode: 'review', paperSize: 'A4' };
      const html = PDFService.buildPDFHTML(mockQuestions, options);
      
      expect(html).toContain('<title>智能错题集</title>');
      expect(html).toContain('第1题');
      expect(html).toContain('第2题');
      // 在背题模式下，每个题目后面都应该有答案
      expect(html).toContain('答案与解析');
    });
  });
});