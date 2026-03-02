const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const { ossService } = require('./ossService');

/**
 * 优化版PDF生成服务 - 添加缓存和性能优化
 */
class PDFServiceOptimized {
  constructor() {
    this.browser = null;
    this.pageCache = new Map(); // 页面实例缓存
    this.htmlCache = new Map(); // HTML内容缓存
  }

  /**
   * 初始化Puppeteer浏览器实例（带性能优化）
   */
  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-ipc-flooding-protection',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows'
        ],
        // 性能优化选项
        ignoreHTTPSErrors: true,
        slowMo: 0,
        timeout: 30000
      });
    }
  }

  /**
   * 获取或创建页面实例（带缓存）
   */
  async getPage() {
    const pageKey = 'default';
    if (this.pageCache.has(pageKey)) {
      const page = this.pageCache.get(pageKey);
      // 检查页面是否仍然有效
      try {
        await page.evaluate(() => document.title);
        return page;
      } catch (error) {
        // 页面无效，移除缓存
        this.pageCache.delete(pageKey);
      }
    }

    const page = await this.browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // 设置页面超时
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    this.pageCache.set(pageKey, page);
    return page;
  }

  /**
   * 生成错题练习卷PDF（优化版）
   */
  async generateErrorBookPDF(questions, options, childName) {
    await this.init();

    // 生成缓存键
    const cacheKey = this.generateCacheKey(questions, options, childName);
    
    // 检查HTML缓存
    let htmlContent;
    if (this.htmlCache.has(cacheKey)) {
      htmlContent = this.htmlCache.get(cacheKey);
    } else {
      htmlContent = this.buildPDFHTML(questions, options);
      this.htmlCache.set(cacheKey, htmlContent);
      
      // 限制缓存大小
      if (this.htmlCache.size > 50) {
        const firstKey = this.htmlCache.keys().next().value;
        this.htmlCache.delete(firstKey);
      }
    }
    
    const page = await this.getPage();
    
    // 设置页面尺寸
    const format = options.paperSize?.toLowerCase() || 'a4';
    
    // 使用setContent而不是goto，避免网络请求
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // 生成PDF
    const timestamp = Date.now();
    const filename = `${childName}_错题集_${timestamp}.pdf`;
    const filePath = path.join('/tmp', filename);
    
    await page.pdf({
      path: filePath,
      format: format,
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      },
      // 性能优化：减少质量但提高速度
      quality: 80,
      preferCSSPageSize: false
    });
    
    return filePath;
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(questions, options, childName) {
    const questionIds = questions.map(q => q._id || q.id).sort().join(',');
    const optionString = JSON.stringify(options);
    return `${childName}_${questionIds}_${optionString}`;
  }

  /**
   * 构建PDF的HTML内容（优化版）
   */
  buildPDFHTML(questions, options) {
    const mode = options.mode || 'practice';
    const paperSize = options.paperSize?.toLowerCase() || 'a4';
    
    // 根据纸张大小调整样式
    let fontSize = '14px';
    let lineHeight = '1.5';
    if (paperSize === 'a3') {
      fontSize = '16px';
      lineHeight = '1.6';
    } else if (paperSize === 'a5') {
      fontSize = '12px';
      lineHeight = '1.4';
    }

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>智能错题集</title>
      <style>
        body {
          font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
          font-size: ${fontSize};
          line-height: ${lineHeight};
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        .question {
          margin-bottom: 25px;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .question-number {
          font-weight: bold;
          color: #e74c3c;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .question-content {
          margin-bottom: 12px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .original-image, .clean-image {
          max-width: 100%;
          max-height: 400px;
          height: auto;
          margin: 8px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          display: block;
        }
        .answer-section {
          margin-top: 12px;
          padding: 12px;
          background-color: #f8f9fa;
          border-left: 4px solid #007bff;
          border-radius: 4px;
        }
        .answer-title {
          font-weight: bold;
          margin-bottom: 8px;
          color: #007bff;
          font-size: 14px;
        }
        .answer-content {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .metadata {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #eee;
        }
        @media print {
          .page-break {
            page-break-before: always;
            break-before: page;
          }
        }
        /* 针对不同纸张大小的优化 */
        @page {
          size: ${paperSize.toUpperCase()};
          margin: 15mm;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>智能错题集</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        <p>模式: ${mode === 'practice' ? '刷题模式' : '背题模式'}</p>
      </div>
    `;

    questions.forEach((question, index) => {
      const questionNumber = index + 1;
      
      html += `
      <div class="question">
        <div class="question-number">第${questionNumber}题</div>
        <div class="question-content">${this.escapeHtml(question.ocrText || question.content || '')}</div>
      `;
      
      // 添加原图和去手写图
      if (question.originalImage) {
        html += `<img src="${question.originalImage}" alt="原题" class="original-image">`;
      }
      if (question.cleanedImage) {
        html += `<img src="${question.cleanedImage}" alt="去手写后" class="clean-image">`;
      }
      
      // 显示元数据
      html += `
        <div class="metadata">
          学科: ${question.subject || '未知'} | 
          年级: ${question.grade || '未知'} |
          错误原因: ${question.errorReason || '未分类'}
        </div>
      `;
      
      // 根据模式决定答案显示位置
      if (mode === 'review') {
        // 背题模式：答案紧跟题目
        if (question.answer || question.explanation) {
          html += `
          <div class="answer-section">
            <div class="answer-title">答案与解析</div>
            <div class="answer-content">
              ${this.escapeHtml(question.answer || '')}
              ${question.explanation ? '\n\n解析: ' + this.escapeHtml(question.explanation) : ''}
            </div>
          </div>
          `;
        }
      }
      
      html += '</div>';
    });
    
    // 刷题模式：所有答案统一放在最后
    if (mode === 'practice' && questions.some(q => q.answer || q.explanation)) {
      html += '<div class="page-break"></div>';
      html += '<div class="header"><h2>答案与解析</h2></div>';
      
      questions.forEach((question, index) => {
        if (question.answer || question.explanation) {
          html += `
          <div class="question">
            <div class="question-number">第${index + 1}题</div>
            <div class="answer-content">
              ${this.escapeHtml(question.answer || '')}
              ${question.explanation ? '\n\n解析: ' + this.escapeHtml(question.explanation) : ''}
            </div>
          </div>
          `;
        }
      });
    }
    
    html += '</body></html>';
    return html;
  }

  /**
   * HTML转义函数
   */
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 批量生成PDF（用于多个孩子的错题集）
   */
  async generateMultiplePDFs(pdfConfigs) {
    const results = [];
    for (const config of pdfConfigs) {
      try {
        const filePath = await this.generateErrorBookPDF(
          config.questions,
          config.options,
          config.childName
        );
        results.push({ success: true, filePath, childName: config.childName });
      } catch (error) {
        console.error(`生成${config.childName}的PDF失败:`, error);
        results.push({ success: false, error: error.message, childName: config.childName });
      }
    }
    return results;
  }

  /**
   * 上传PDF到OSS并返回URL
   */
  async uploadPDFToOSS(filePath, childId) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      const ossKey = `pdfs/${childId}/${fileName}`;
      
      const url = await ossService.uploadFile(fileBuffer, ossKey, 'application/pdf');
      return url;
    } catch (error) {
      console.error('上传PDF到OSS失败:', error);
      throw error;
    }
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('清理临时文件失败:', error);
    }
  }

  /**
   * 关闭浏览器实例
   */
  async close() {
    if (this.browser) {
      // 清理页面缓存
      for (const [key, page] of this.pageCache.entries()) {
        try {
          await page.close();
        } catch (error) {
          console.warn('关闭页面失败:', error);
        }
      }
      this.pageCache.clear();
      this.htmlCache.clear();
      
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PDFServiceOptimized();